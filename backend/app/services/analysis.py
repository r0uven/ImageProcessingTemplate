import logging
import time
import uuid
from collections.abc import Iterable

from fastapi import HTTPException

from app.api.responses import analysis_response
from app.config.config_loader import APP_SETTINGS
from app.database.models import AnalysisRunModel
from app.database.repositories.analysis_repository import AnalysisRepository
from app.database.repositories.image_repository import ImageRepository
from app.entities.image_data import ImageData
from app.mappers.processing_parameters_mapper import to_processing_parameters
from app.modules.visualisation.overlay_renderer import OverlayRenderer
from app.pipeline.analysis_pipeline import AnalysisPipeline
from app.pipeline.pipeline_context import PipelineContext
from app.schemas.analyze_request import AnalyzeRequest
from app.services.image_conversion import pretty_mask, require_pil
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
    ):
        self.storage = storage
        self.pipeline = pipeline
        self.overlay_renderer = overlay_renderer
        self.image_repository = image_repository
        self.analysis_repository = analysis_repository

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
            return analysis_response(
                run_id=run_id,
                image_id=image_id,
                width=record.width,
                height=record.height,
                detected_objects=cached_run.pore_count,
                available_images=saved_image_names,
            )

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
                ),
                parameters=parameters,
                result=analysis,
            )
        else:
            logger.info("Analysis run already exists: run_id=%s", run_id)

        # Если запуск уже сохранён, записываем только недостающие файлы
        # (например, если они были удалены с диска вручную).
        for name, image_to_save in analysis_images.items():
            if not self.storage.analysis_image_path(run_id, name).is_file():
                self.storage.save_analysis_image(run_id, name, image_to_save)

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
            self.storage.analysis_image_path(run_id, name).is_file()
            for name in names
        )
