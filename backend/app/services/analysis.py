import json
import logging
import time
import uuid
from collections.abc import Iterable
from pathlib import Path

from fastapi import HTTPException
from PIL import Image

from app.api.responses import analysis_response
from app.config.config_loader import APP_SETTINGS
from app.database.models import AnalysisRunModel, MaskModel
from app.database.repositories.analysis_repository import AnalysisRepository
from app.database.repositories.image_repository import ImageRepository
from app.database.repositories.mask_repository import MaskRepository
from app.entities.image_data import ImageData
from app.mappers.processing_parameters_mapper import to_processing_parameters
from app.modules.visualisation.overlay_renderer import OverlayRenderer
from app.pipeline.analysis_pipeline import AnalysisPipeline
from app.pipeline.pipeline_context import PipelineContext
from app.schemas.analyze_request import AnalyzeRequest
from app.services.image_conversion import pretty_mask, require_pil
from app.services.run_snapshot import build_settings_snapshot
from app.storage.image_storage import ImageStorage
from app.utils.run_hash import compute_run_hash

logger = logging.getLogger(__name__)


class AnalysisService:
    def __init__(
        self,
        storage: ImageStorage,
        pipeline: AnalysisPipeline,
        overlay_renderer: OverlayRenderer,
        image_repository: ImageRepository,
        analysis_repository: AnalysisRepository,
        mask_repository: MaskRepository,
    ):
        self.storage = storage
        self.pipeline = pipeline
        self.overlay_renderer = overlay_renderer
        self.image_repository = image_repository
        self.analysis_repository = analysis_repository
        self.mask_repository = mask_repository

    def analyze(self, image_id: str, parameters: AnalyzeRequest) -> dict:
        """Запускает анализ изображения и сохраняет результат и промежуточные картинки."""
        record = self.image_repository.get_by_id(image_id)
        if record is None:
            raise HTTPException(status_code=404, detail="Image not found")

        # Хеш считается только по входным данным: он одновременно является ID
        # запуска, именем подпапки и ключом кэша готовой обработки.
        run_id = compute_run_hash(
            image_id=image_id,
            model_id=parameters.modelId,
            parameters=parameters,
        )

        saved_image_names = self._saved_image_names()
        cached_run = self.analysis_repository.get_analysis_result(run_id)
        if cached_run is not None and self._images_exist(run_id, saved_image_names):
            logger.info("Analysis cache hit: image_id=%s run_id=%s", image_id, run_id)
            self._store_existing_masks(run_id)
            return analysis_response(
                run_id=run_id,
                image_id=image_id,
                width=record.width,
                height=record.height,
                detected_objects=cached_run.pore_count,
                available_images=saved_image_names,
            )

        started_at = time.perf_counter()
        settings_snapshot: str | None = None

        try:
            # Снимок настроек фиксируем до запуска пайплайна: страница
            # результатов должна показывать значения, которые участвовали
            # в обработке, даже если settings.json изменят позже.
            settings_snapshot = self._settings_snapshot(parameters)

            image = self.storage.get_original(record.file_path)
            if image is None:
                raise HTTPException(status_code=404, detail="Image file not found")

            height, width = image.shape[:2]
            context = PipelineContext(
                image_data=ImageData(original_image=image),
                parameters=to_processing_parameters(parameters),
            )

            result = self.pipeline.run(context)
            analysis = result.analysis_result

            postprocessed_mask = result.image_data.postprocessed_mask
            segmentation_mask = result.image_data.segmentation_mask
            if postprocessed_mask is None or result.objects is None:
                raise ValueError("Pipeline did not produce a postprocessed mask")

            # TODO(objects, pores): таблицы objects и pores пока не
            # заполняются. Для objects нужна классификация объектов
            # (object_type: candidate/autonomous, processing_status:
            # classified/processed), для pores — разделение/объединение пор
            # (pore_type: autonomous/separated/not_separated и
            # parent_object_id). После реализации этих модулей сохранять
            # result.objects и per-pore строки из feature_extractor.

            output_values = context.parameters.segmentation.output_mask
            foreground_value = output_values.foreground_value
            background_value = output_values.background_value

            analysis_images = {}
            if "preprocessed" in saved_image_names:
                analysis_images["preprocessed"] = require_pil(
                    result.image_data.preprocessed_image, "preprocessed"
                )
            if "segmentation" in saved_image_names:
                analysis_images["segmentation"] = pretty_mask(
                    segmentation_mask,
                    "segmentation",
                    foreground_value=foreground_value,
                    background_value=background_value,
                )
            if "postprocessed" in saved_image_names:
                analysis_images["postprocessed"] = pretty_mask(
                    postprocessed_mask,
                    "postprocessed",
                    foreground_value=foreground_value,
                    background_value=background_value,
                )
            if "overlay" in saved_image_names:
                overlay = self.overlay_renderer.render_detection_overlay(
                    postprocessed_mask,
                    result.objects,
                )
                analysis_images["overlay"] = require_pil(overlay, "overlay")

            if not self.analysis_repository.run_exists(run_id):
                duration = time.perf_counter() - started_at
                analysis_result_id = str(uuid.uuid4())
                analysis.analysis_result_id = analysis_result_id

                self.analysis_repository.create_analysis(
                    run=AnalysisRunModel(
                        run_id=run_id,
                        image_id=image_id,
                        model_id=parameters.modelId,
                        params_id=parameters.parametersId,
                        analysis_result_id=analysis_result_id,
                        created_at=int(time.time()),
                        settings_snapshot=settings_snapshot,
                        duration=round(duration, 6),
                        status="SUCCESS",
                    ),
                    parameters=parameters,
                    result=analysis,
                )
            else:
                logger.info("Analysis run already exists: run_id=%s", run_id)

            # Если запуск уже сохранён, записываем только недостающие файлы
            # (например, если они были удалены с диска вручную).
            saved_paths = self._save_analysis_images(run_id, analysis_images)
            self._store_masks(run_id, saved_paths)

            logger.info(
                "Analysis completed: image_id=%s run_id=%s detected_objects=%s",
                image_id,
                run_id,
                analysis.pore_count,
            )

            return analysis_response(
                run_id=run_id,
                image_id=image_id,
                width=width,
                height=height,
                detected_objects=analysis.pore_count,
                available_images=set(analysis_images),
            )
        except Exception as error:
            # Неудачная попытка тоже должна попасть в историю. Если запуск
            # уже был успешно сохранён, репозиторий не перезапишет его.
            self._record_failure(
                run_id=run_id,
                image_id=image_id,
                model_id=parameters.modelId,
                duration=time.perf_counter() - started_at,
                error=error,
                settings_snapshot=settings_snapshot,
            )
            raise

    def _save_analysis_images(
        self,
        run_id: str,
        images: dict[str, Image.Image],
    ) -> dict[str, Path]:
        """Сохраняет отсутствующие изображения анализа и возвращает их пути."""
        paths: dict[str, Path] = {}

        for name, image in images.items():
            path = self.storage.find_analysis_image_path(run_id, name)
            if path is None:
                path = self.storage.save_analysis_image(run_id, name, image)

            paths[name] = path

        return paths

    def _store_existing_masks(self, run_id: str) -> None:
        """Дозаполняет masks для уже сохранённого запуска (cache hit)."""
        paths: dict[str, Path] = {}

        for name in ("segmentation", "postprocessed"):
            path = self.storage.find_analysis_image_path(run_id, name)
            if path is not None:
                paths[name] = path

        self._store_masks(run_id, paths)

    def _store_masks(self, run_id: str, paths: dict[str, Path]) -> None:
        """Пишет в БД метаданные сохранённых масок.
        ``segmentation`` — сырая маска (raw), ``postprocessed`` — очищенная
        (cleaned). Если соответствующее изображение не сохранялось, строки
        не создаются.
        """
        for name, mask_type in (
            ("segmentation", "raw"),
            ("postprocessed", "cleaned"),
        ):
            path = paths.get(name)
            if path is None or not path.is_file():
                continue

            try:
                self.mask_repository.upsert(
                    MaskModel(
                        mask_id=f"{run_id}:{mask_type}",
                        run_id=run_id,
                        mask_type=mask_type,
                        file_path=str(path),
                    )
                )
            except Exception:
                # Метаданные маски не должны ломать уже успешный анализ.
                logger.exception(
                    "Failed to store mask metadata: run_id=%s type=%s",
                    run_id,
                    mask_type,
                )

    def _record_failure(
        self,
        *,
        run_id: str,
        image_id: str,
        model_id: str,
        duration: float,
        error: BaseException,
        settings_snapshot: str | None,
    ) -> None:
        message = f"{type(error).__name__}: {error}"[:2000]

        try:
            self.analysis_repository.record_failure(
                AnalysisRunModel(
                    run_id=run_id,
                    image_id=image_id,
                    model_id=model_id,
                    params_id="",
                    created_at=int(time.time()),
                    settings_snapshot=settings_snapshot,
                    duration=round(duration, 6),
                    status="FAILED",
                    error_message=message,
                )
            )
        except Exception:
            # Ошибка записи не должна подменять исходное исключение анализа.
            logger.exception(
                "Failed to persist failed analysis run: run_id=%s", run_id
            )

    @staticmethod
    def _settings_snapshot(parameters: AnalyzeRequest) -> str | None:
        """Сериализует параметры запуска, если это разрешено настройками."""
        if not APP_SETTINGS["analysis_pipeline"]["save_run_parameters"]:
            return None

        snapshot = build_settings_snapshot(parameters)
        return json.dumps(snapshot, ensure_ascii=False, sort_keys=True)

    @staticmethod
    def _saved_image_names() -> set[str]:
        """Какие изображения сохранять — определяется analysis_pipeline."""
        settings = APP_SETTINGS["analysis_pipeline"]
        names: set[str] = set()

        if settings["save_intermediate_results"]:
            names.add("preprocessed")
        if settings["save_segmentation_mask"]:
            names.add("segmentation")
        if settings["save_postprocessed_mask"]:
            names.add("postprocessed")
        if settings["save_final_objects"]:
            names.add("overlay")

        return names

    def _images_exist(self, run_id: str, names: Iterable[str]) -> bool:
        """Проверяет, что все результирующие картинки запуска есть на диске."""
        return all(
            self.storage.find_analysis_image_path(run_id, name) is not None
            for name in names
        )
