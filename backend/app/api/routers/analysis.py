from fastapi import APIRouter, HTTPException

from app.api.constants import AnalysisImageType
from app.api.dependencies import (
    AnalysisRepositoryDep,
    ImageRepositoryDep,
    OverlayDep,
    PipelineDep,
    StorageDep,
)
from app.schemas.analyze_request import AnalyzeRequest
from app.services.analysis import AnalysisService
from app.services.image_conversion import png_response
from app.services.metrics import build_metrics

router = APIRouter(prefix="/analysis")


@router.post("/{image_id}")
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
    service = AnalysisService(
        storage=storage,
        pipeline=pipeline,
        overlay_renderer=overlay_renderer,
        image_repository=image_repository,
        analysis_repository=analysis_repository,
    )
    return service.analyze(image_id, parameters)


@router.get("/{run_id}/images/{image_type}")
def get_analysis_image(
    run_id: str,
    image_type: AnalysisImageType,
    storage: StorageDep,
):
    try:
        path = storage.find_analysis_image_path(run_id, image_type)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Analysis image not found") from exc

    if path is None:
        raise HTTPException(status_code=404, detail="Analysis image not found")

    image = storage.get_analysis_image(path)
    if image is None:
        raise HTTPException(status_code=404, detail="Analysis image not found")

    return png_response(image)


@router.get("/{run_id}/metrics")
def get_analysis_metrics(
    run_id: str,
    analysis_repository: AnalysisRepositoryDep,
    storage: StorageDep,
):
    """Метрики одного запуска: распределения и статистика по порам."""
    record = analysis_repository.get_analysis_result(run_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return build_metrics(record, storage)
