import json
import logging
import statistics
import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from io import BytesIO
from pathlib import Path
from typing import Annotated, Literal

import cv2
import numpy as np
from app.database.connection import get_connection
from app.database.migrator import run_migrations
from app.database.models import ImageModel
from app.database.repositories.analysis_repository import AnalysisRepository
from app.database.repositories.image_repository import ImageRepository
from app.database.repositories.tool_repository import ToolRepository
from app.entities.image_data import ImageData
from app.mappers.processing_parameters_mapper import to_processing_parameters
from app.modules.image_loader.image_loader import ImageLoader
from app.modules.visualisation.overlay_renderer import OverlayRenderer
from app.pipeline.analysis_pipeline import AnalysisPipeline
from app.pipeline.pipeline_context import PipelineContext
from app.schemas.analyze_request import AnalyzeRequest
from app.storage.image_storage import ImageStorage
from fastapi import Depends, FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

logger = logging.getLogger(__name__)

DEFAULT_STORAGE_DIR = "data/images"

AnalysisImageType = Literal["preprocessed", "segmentation", "postprocessed", "overlay"]


# ============================================================
# Зависимости
# ============================================================


def get_storage(request: Request) -> ImageStorage:
    return request.app.state.storage


def get_image_loader(request: Request) -> ImageLoader:
    return request.app.state.image_loader


def get_analysis_pipeline(request: Request) -> AnalysisPipeline:
    return request.app.state.analysis_pipeline


def get_overlay_renderer(request: Request) -> OverlayRenderer:
    return request.app.state.overlay_renderer


def get_image_repository(request: Request) -> ImageRepository:
    return request.app.state.image_repository


def get_analysis_repository(request: Request) -> AnalysisRepository:
    return request.app.state.analysis_repository


def get_tool_repository(request: Request) -> ToolRepository:
    return request.app.state.tool_repository


StorageDep = Annotated[ImageStorage, Depends(get_storage)]
LoaderDep = Annotated[ImageLoader, Depends(get_image_loader)]
PipelineDep = Annotated[AnalysisPipeline, Depends(get_analysis_pipeline)]
OverlayDep = Annotated[OverlayRenderer, Depends(get_overlay_renderer)]
ImageRepositoryDep = Annotated[ImageRepository, Depends(get_image_repository)]
AnalysisRepositoryDep = Annotated[AnalysisRepository, Depends(get_analysis_repository)]
ToolRepositoryDep = Annotated[ToolRepository, Depends(get_tool_repository)]


# ============================================================
# Приложение
# ============================================================


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Поднимает БД, миграции и сервисы; закрывает соединение при остановке."""
    db = get_connection()

    try:
        run_migrations(db)

        app.state.db = db
        app.state.storage = ImageStorage(
            DEFAULT_STORAGE_DIR
        )  # см. ниже про переменную окружения
        app.state.tool_repository = ToolRepository(db)
        app.state.analysis_repository = AnalysisRepository(db)
        app.state.image_repository = ImageRepository(db)
        app.state.image_loader = ImageLoader()
        app.state.analysis_pipeline = AnalysisPipeline()
        app.state.overlay_renderer = OverlayRenderer()

        logger.info("Application started")
        yield
    finally:
        db.close()
        logger.info("Application stopped")


app = FastAPI(title="Image Analysis API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_health_requests(request: Request, call_next):
    """Пишет в лог клиентов, которые опрашивают /health."""
    if request.url.path == "/health":
        logger.debug(
            "Health check: ua=%s origin=%s referer=%s host=%s",
            request.headers.get("user-agent"),
            request.headers.get("origin"),
            request.headers.get("referer"),
            request.headers.get("host"),
        )
    return await call_next(request)


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/v1/models")
def models() -> dict[str, str]:
    return {"status": "ok"}


# ============================================================
# Вспомогательные функции
# ============================================================


def _to_pil(image: np.ndarray | Image.Image) -> Image.Image:
    """Приводит OpenCV-массив (BGR/BGRA) к PIL.Image (RGB/RGBA)."""
    if isinstance(image, Image.Image):
        return image
    if image.ndim == 3 and image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2RGBA)
    elif image.ndim == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return Image.fromarray(image)


def _png_response(image: Image.Image) -> Response:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return Response(content=buffer.getvalue(), media_type="image/png")


def _remove_files(*paths: Path) -> None:
    for path in paths:
        try:
            path.unlink(missing_ok=True)
        except OSError:
            logger.warning("Failed to remove file: %s", path)


def _upload_response(image_id: str, preview: Image.Image) -> dict:
    return {
        "image_id": image_id,
        "preview_url": f"/images/{image_id}/preview",
        "width": preview.width,
        "height": preview.height,
    }


def _restore_original(
    existing: ImageModel,
    image_bytes: bytes,
    suffix: str,
    storage: ImageStorage,
    image_repository: ImageRepository,
) -> Path:
    """Записывает оригинал заново и обновляет путь в БД, если он изменился."""
    logger.warning("Original file missing, restoring: image_id=%s", existing.image_id)

    try:
        new_path = storage.save_original(existing.image_id, image_bytes, suffix)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Unsupported file type") from exc

    if str(new_path) != existing.file_path:
        image_repository.update_file_path(existing.image_id, str(new_path))

    return new_path


def _reuse_existing_image(
    existing: ImageModel,
    image_bytes: bytes,
    suffix: str,
    preview: Image.Image,
    storage: ImageStorage,
    image_repository: ImageRepository,
) -> dict:
    """Возвращает уже загруженное изображение, восстанавливая оригинал при необходимости."""
    if not Path(existing.file_path).is_file():
        _restore_original(existing, image_bytes, suffix, storage, image_repository)

    storage.save_preview(existing.image_id, preview)
    logger.info("Image already exists: image_id=%s", existing.image_id)
    return _upload_response(existing.image_id, preview)


# ============================================================
# Загрузка
# ============================================================


@app.post("/upload")
async def upload_image(
    file: Annotated[UploadFile, File()],
    storage: StorageDep,
    loader: LoaderDep,
    image_repository: ImageRepositoryDep,
) -> dict:
    """Сохраняет изображение. Если такое уже загружено (по хэшу), возвращает существующее."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        original_image, preview_image = await run_in_threadpool(
            loader.load_image, image_bytes, file.filename
        )
    except Exception as exc:
        logger.exception("Failed to load image: %s", file.filename)
        raise HTTPException(status_code=400, detail="Invalid image file") from exc

    content_hash = storage.compute_hash(image_bytes)
    suffix = Path(file.filename).suffix or ".png"
    existing = image_repository.get_by_hash(content_hash)
    if existing is not None:
        return _reuse_existing_image(
            existing,
            image_bytes,
            suffix,
            preview_image,
            storage,
            image_repository,
        )

    image_id = str(uuid.uuid4())
    suffix = Path(file.filename).suffix or ".png"

    try:
        file_path = storage.save_original(image_id, image_bytes, suffix)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Unsupported file type") from exc

    try:
        storage.save_preview(image_id, preview_image)
        image_repository.create(
            ImageModel(
                image_id=image_id,
                file_path=str(file_path),
                width=int(original_image.shape[1]),
                height=int(original_image.shape[0]),
                scale_value=1.0,
                content_hash=content_hash,
            )
        )
    except Exception as exc:
        logger.exception("Failed to persist image: %s", file.filename)
        # Откат: без записи в БД файлы не должны оставаться на диске.
        _remove_files(file_path, storage.preview_path(image_id))
        raise HTTPException(status_code=500, detail="Failed to store image") from exc

    logger.info("Image uploaded: image_id=%s filename=%s", image_id, file.filename)
    return _upload_response(image_id, preview_image)


# ============================================================
# Анализ
# ============================================================


@app.post("/analysis/{image_id}")
def analyze_image(
    image_id: str,
    parameters: AnalyzeRequest,
    storage: StorageDep,
    pipeline: PipelineDep,
    overlay_renderer: OverlayDep,
    image_repository: ImageRepositoryDep,
    analysis_repository: AnalysisRepositoryDep,
) -> dict:
    """Запускает анализ изображения и сохраняет результат и промежуточные картинки."""
    record = image_repository.get_by_id(image_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Image not found")

    image = storage.get_original(record.file_path)
    if image is None:
        raise HTTPException(status_code=404, detail="Image file not found")

    height, width = image.shape[:2]
    context = PipelineContext(
        image_data=ImageData(
            filename=image_id,
            original_image=image,
            image_shape=(width, height),
        ),
        parameters=to_processing_parameters(parameters),
    )

    result = pipeline.run(context)
    analysis = result.analysis_result

    overlay = overlay_renderer.render_detection_overlay(
        result.image_data.postprocessed_mask,
        result.objects,
    )

    run_id = str(uuid.uuid4())
    analysis_result_id = str(uuid.uuid4())
    analysis.analysis_result_id = analysis_result_id
    analysis.run_id = run_id

    analysis_repository.create_analysis_result(
        analysis_result_id=analysis_result_id,
        pore_count=analysis.pore_count,
        porosity=analysis.porosity,
        area=analysis.area,
        diameter=analysis.diameter,
        size_distribution=analysis.size_distribution,
    )
    analysis_repository.create_run(
        run_id=run_id,
        image_id=image_id,
        model_id=parameters.modelId,
        analysis_result_id=analysis_result_id,
        parameters=parameters,
    )

    analysis_images = {
        "preprocessed": result.image_data.preprocessed_image,
        "segmentation": result.image_data.segmentation_mask,
        "postprocessed": result.image_data.postprocessed_mask,
        "overlay": overlay,
    }
    for name, image_to_save in analysis_images.items():
        storage.save_analysis_image(run_id, name, _to_pil(image_to_save))

    logger.info(
        "Analysis completed: image_id=%s run_id=%s detected_objects=%s",
        image_id,
        run_id,
        analysis.pore_count,
    )

    images_url = f"/analysis/{run_id}/images"
    return {
        "status": "success",
        "run_id": run_id,
        "image_id": image_id,
        "width": width,
        "height": height,
        "detected_objects": analysis.pore_count,
        "preprocessed_image": f"{images_url}/preprocessed",
        "segmentation_mask": f"{images_url}/segmentation",
        "postprocessed_mask": f"{images_url}/postprocessed",
        "detection_overlay": f"{images_url}/overlay",
    }


# ============================================================
# Изображения
# ============================================================


@app.get("/images")
def list_images(image_repository: ImageRepositoryDep):
    return image_repository.get_all()


@app.get("/images/{image_id}")
def get_image_info(image_id: str, image_repository: ImageRepositoryDep):
    record = image_repository.get_by_id(image_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return record


@app.get("/images/{image_id}/preview")
def get_preview(
    image_id: str,
    storage: StorageDep,
    image_repository: ImageRepositoryDep,
):
    """Отдаёт превью PNG. Если превью нет на диске, генерирует его из оригинала."""
    record = image_repository.get_by_id(image_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Image not found")

    preview = storage.get_preview(storage.preview_path(image_id))

    if preview is None:
        original = storage.get_original(record.file_path)
        if original is None:
            raise HTTPException(status_code=404, detail="Image file not found")

        preview = _to_pil(original)
        storage.save_preview(image_id, preview)

    return _png_response(preview)


# ============================================================
# Изображения анализа
# ============================================================


@app.get("/analysis/{run_id}/images/{image_type}")
def get_analysis_image(
    run_id: str,
    image_type: AnalysisImageType,
    storage: StorageDep,
):
    try:
        path = storage.analysis_image_path(run_id, image_type)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Analysis image not found") from exc

    image = storage.get_analysis_image(path)
    if image is None:
        raise HTTPException(status_code=404, detail="Analysis image not found")

    return _png_response(image)


# ============================================================
# Инструменты
# ============================================================


@app.get("/tools")
def get_tools(tool_repository: ToolRepositoryDep):
    return tool_repository.get_all()


@app.delete("/tools/{model_id}", status_code=204)
def delete_tool(model_id: str, tool_repository: ToolRepositoryDep) -> None:
    try:
        deleted = tool_repository.delete(model_id)
    except Exception as exc:
        logger.exception("Failed to delete tool: %s", model_id)
        raise HTTPException(
            status_code=409,
            detail="Tool cannot be deleted because it is in use",
        ) from exc

    if not deleted:
        raise HTTPException(status_code=404, detail="Tool not found or not removable")


# ============================================================
# История и метрики
# ============================================================


@app.get("/history")
def get_history(
    analysis_repository: AnalysisRepositoryDep,
    tool_repository: ToolRepositoryDep,
) -> list[dict]:
    """Список всех запусков анализа для таблицы истории."""
    history = []

    for run in analysis_repository.get_all_runs():
        (
            run_id,
            image_id,
            model_id,
            created_at,
            file_path,
            width,
            height,
            _pore_count,
        ) = run

        model = tool_repository.get_by_id(model_id)
        model_name = model.model_name if model is not None else model_id

        history.append(
            {
                "run_id": run_id,
                "image_id": image_id,
                "filename": Path(file_path).name,
                "modelName": model_name,
                "createdAt": datetime.fromtimestamp(created_at, tz=UTC).strftime(
                    "%d.%m.%Y %H:%M"
                ),
                "duration": 0.0,  # пока не сохраняется в БД
                "width": width,
                "height": height,
                "status": "SUCCESS",  # пока не сохраняется в БД
                "previewUrl": f"/analysis/{run_id}/images/overlay",
            }
        )

    return history


def _describe(values: list[float]) -> dict[str, float]:
    """Считает статистику по списку значений; для пустого списка возвращает нули."""
    if not values:
        return {
            "min": 0.0,
            "max": 0.0,
            "mean": 0.0,
            "median": 0.0,
            "standardDeviation": 0.0,
        }

    return {
        "min": float(min(values)),
        "max": float(max(values)),
        "mean": float(sum(values) / len(values)),
        "median": float(statistics.median(values)),
        "standardDeviation": float(statistics.pstdev(values)),
    }


def _points(values: list[float]) -> list[dict[str, float]]:
    """Превращает значения в точки для графика распределения."""
    return [{"x": float(value), "y": 1} for value in values]


def _parse_size_distribution(raw: str | None) -> dict:
    if raw is None:
        return {}
    try:
        data = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        return {}
    return data if isinstance(data, dict) else {}


@app.get("/analysis/{run_id}/metrics")
def get_analysis_metrics(run_id: str, analysis_repository: AnalysisRepositoryDep):
    """Метрики одного запуска: распределения и статистика по порам."""
    row = analysis_repository.get_analysis_result(run_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Analysis not found")

    (
        _run_id,
        image_id,
        _model_id,
        _params_id,
        _created_at,
        _analysis_result_id,
        pore_count,
        _porosity,
        area,
        diameter,
        size_distribution_raw,
        file_path,
        _width,
        _height,
    ) = row

    distribution = _parse_size_distribution(size_distribution_raw)
    areas = distribution.get("areas", [])
    diameters = distribution.get("diameters", [])

    # Если детального распределения нет, статистику строим по одному агрегированному значению.
    area_values = areas or ([area] if area > 0 else [])
    diameter_values = diameters or ([diameter] if diameter > 0 else [])

    zero_stats = _describe([])

    return {
        "filename": Path(file_path).name if file_path else image_id,
        "detectedObjects": pore_count,
        "distributions": {
            "PORE_SIZE": _points(diameters),
            "AREA": _points(areas),
            "PERIMETER": [],
            "CIRCULARITY": [],
            "FORM_FACTOR": [],
        },
        "statistics": {
            "PORE_SIZE": _describe(diameter_values),
            "AREA": _describe(area_values),
            "PERIMETER": zero_stats,
            "CIRCULARITY": zero_stats,
            "FORM_FACTOR": zero_stats,
        },
    }
