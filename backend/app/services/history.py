import logging
from datetime import UTC, datetime
from pathlib import Path

from app.database.repositories.analysis_repository import AnalysisRepository
from app.database.repositories.tool_repository import ToolRepository
from app.storage.image_storage import ImageStorage

logger = logging.getLogger(__name__)


def list_history(
    analysis_repository: AnalysisRepository,
    tool_repository: ToolRepository,
) -> list[dict]:
    """Список всех запусков анализа для таблицы истории."""
    model_names = {
        model.model_id: model.model_name for model in tool_repository.get_all()
    }

    history = []
    for run in analysis_repository.get_all_runs():
        history.append(
            {
                "run_id": run.run_id,
                "image_id": run.image_id,
                "filename": run.original_image_name or Path(run.file_path).name,
                "modelName": model_names.get(run.model_id, run.model_id),
                "createdAt": datetime.fromtimestamp(
                    run.created_at,
                    tz=UTC,
                ).strftime("%d.%m.%Y %H:%M"),
                "duration": 0.0,  # пока не сохраняется в БД
                "width": run.width,
                "height": run.height,
                "status": "SUCCESS",  # пока не сохраняется в БД
                "previewUrl": f"/analysis/{run.run_id}/images/overlay",
            }
        )

    return history


def delete_history_entry(
    run_id: str,
    storage: ImageStorage,
    analysis_repository: AnalysisRepository,
) -> bool:
    """Удаляет запуск анализа из истории вместе с его результатами и файлами."""
    if not analysis_repository.delete_run(run_id):
        return False

    try:
        storage.delete_analysis_images(run_id)
    except ValueError:
        return False

    logger.info("Analysis run deleted: run_id=%s", run_id)
    return True
