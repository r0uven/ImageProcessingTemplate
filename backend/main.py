import logging
import uuid
from contextlib import asynccontextmanager
from io import BytesIO
from typing import Literal

from app.database.connection import get_connection
from app.database.migrator import run_migrations
from app.database.repositories.analysis_repository import AnalysisRepository
from app.database.repositories.tool_repository import ToolRepository
from app.entities.image_data import ImageData
from app.mappers.processing_parameters_mapper import to_processing_parameters
from app.modules.image_loader.image_loader import ImageLoader
from app.modules.visualisation.overlay_renderer import OverlayRenderer
from app.pipeline.analysis_pipeline import AnalysisPipeline
from app.pipeline.pipeline_context import PipelineContext
from app.schemas.analyze_request import AnalyzeRequest
from app.storage.image_storage import ImageStorage
from app.utils.converter_to_pillow import image_to_buffer
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

logger = logging.getLogger(__name__)


AnalysisImageType = Literal[
    "preprocessed",
    "segmentation",
    "postprocessed",
    "overlay",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = get_connection()

    try:
        run_migrations(db)

        app.state.db = db

        app.state.storage = ImageStorage()

        app.state.tool_repository = ToolRepository(db)
        app.state.analysis_repository = AnalysisRepository(db)

        app.state.image_loader = ImageLoader()
        app.state.analysis_pipeline = AnalysisPipeline()
        app.state.overlay_renderer = OverlayRenderer()

        logger.info("Application started")

        yield

    finally:
        db.close()
        logger.info("Application stopped")


app = FastAPI(
    title="Image Analysis API",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Root
# ============================================================


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "ok"}


# ============================================================
# Upload
# ============================================================


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):  # noqa: B008
    storage: ImageStorage = app.state.storage
    loader: ImageLoader = app.state.image_loader

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty",
        )
    if file.filename is None:
        raise HTTPException(
            status_code=400,
            detail="Filename is required",
        )

    try:
        original_image, preview_image = loader.load_image(
            image_bytes,
            file.filename,
        )

    except Exception as exc:
        logger.exception(
            "Failed to load image: %s",
            file.filename,
        )

        raise HTTPException(
            status_code=400,
            detail="Invalid image file",
        ) from exc

    image_id = str(uuid.uuid4())

    storage.save(
        image_id,
        original_image,
    )

    storage.save_preview(
        image_id,
        preview_image,
    )

    logger.info(
        "Image uploaded: image_id=%s filename=%s",
        image_id,
        file.filename,
    )

    return {
        "image_id": image_id,
        "preview_url": f"/images/{image_id}/preview",
        "width": preview_image.width,
        "height": preview_image.height,
    }


# ============================================================
# Analysis
# ============================================================


@app.post("/analysis/{image_id}")
def analyze_image(
    image_id: str,
    parameters: AnalyzeRequest,
):
    storage: ImageStorage = app.state.storage
    pipeline: AnalysisPipeline = app.state.analysis_pipeline
    overlay_renderer: OverlayRenderer = app.state.overlay_renderer
    analysis_repository: AnalysisRepository = app.state.analysis_repository

    image = storage.get(image_id)

    if image is None:
        raise HTTPException(
            status_code=404,
            detail="Image not found",
        )

    image_data = ImageData(
        filename=image_id,
        original_image=image,
        image_shape=image.size,
    )
    processing_parameters = to_processing_parameters(parameters)
    context = PipelineContext(
        image_data=image_data,
        parameters=processing_parameters,
    )

    result = pipeline.run(context)

    detected_objects = result.objects

    overlay_image = overlay_renderer.render_detection_overlay(
        result.image_data.postprocessed_mask,
        detected_objects,
    )

    run_id = str(uuid.uuid4())

    analysis_repository.create_run(
        run_id=run_id,
        image_id=image_id,
        analysis_result_id=result.analysis_result.analysis_result_id,
        parameters=parameters,
        model_id=parameters.modelId,
    )

    storage.save_analysis_image(
        run_id,
        "preprocessed",
        result.image_data.preprocessed_image,
    )

    storage.save_analysis_image(
        run_id,
        "segmentation",
        result.image_data.segmentation_mask,
    )

    storage.save_analysis_image(
        run_id,
        "postprocessed",
        result.image_data.postprocessed_mask,
    )

    storage.save_analysis_image(
        run_id,
        "overlay",
        overlay_image,
    )

    logger.info(
        "Analysis completed: image_id=%s run_id=%s detected_objects=%s",
        image_id,
        run_id,
        result.analysis_result.pore_count,
    )

    return {
        "status": "success",
        "run_id": run_id,
        "image_id": image_id,
        "width": image.width,
        "height": image.height,
        "detected_objects": result.analysis_result.pore_count,
        "preprocessed_image": f"/analysis/{run_id}/images/preprocessed",
        "segmentation_mask": f"/analysis/{run_id}/images/segmentation",
        "postprocessed_mask": f"/analysis/{run_id}/images/postprocessed",
        "detection_overlay": f"/analysis/{run_id}/images/overlay",
    }


# ============================================================
# Original image
# ============================================================


@app.get("/images/{image_id}/preview")
def get_preview(image_id: str):
    storage: ImageStorage = app.state.storage

    image = storage.get_preview(image_id)

    if image is None:
        raise HTTPException(
            status_code=404,
            detail="Preview not found",
        )

    buffer = BytesIO()

    image.save(
        buffer,
        format="PNG",
    )

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="image/png",
    )


# ============================================================
# Analysis images
# ============================================================


@app.get("/analysis/{run_id}/images/{image_type}")
def get_analysis_image(
    run_id: str,
    image_type: AnalysisImageType,
):
    storage: ImageStorage = app.state.storage

    image = storage.get_analysis_image(
        run_id,
        image_type,
    )

    if image is None:
        raise HTTPException(
            status_code=404,
            detail="Analysis image not found",
        )

    buffer = image_to_buffer(image)

    return StreamingResponse(
        buffer,
        media_type="image/png",
    )


# ============================================================
# Tools
# ============================================================


@app.get("/tools")
def get_tools():
    repository: ToolRepository = app.state.tool_repository

    return repository.get_all()


# ============================================================
# Analysis metrics
# ============================================================


@app.get("/analysis/{run_id}/metrics")
def get_analysis_metrics(run_id: str):
    repository: AnalysisRepository = app.state.analysis_repository

    metrics = repository.get_analysis_result(run_id)

    if metrics is None:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found",
        )

    return metrics
