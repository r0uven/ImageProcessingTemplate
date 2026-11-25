from fastapi import APIRouter, HTTPException, Response

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
from app.services.metrics import build_metrics, build_pores_csv

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


@router.get("/{run_id}/export/csv")
def export_analysis_csv(
    run_id: str,
    analysis_repository: AnalysisRepositoryDep,
    storage: StorageDep,
) -> Response:
    """Выгружает базовые метрики и таблицу пор в CSV."""
    record = analysis_repository.get_analysis_result(run_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Analysis not found")

    csv_text = build_pores_csv(record, storage)

    return Response(
        content=csv_text,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="pores_{run_id}.csv"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )
