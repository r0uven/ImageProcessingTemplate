"""Сервис истории: формирование списка запусков и удаление записей."""

import logging
from datetime import UTC, datetime
from pathlib import Path

from app.config.config_loader import APP_SETTINGS
from app.database.models import HistoryRunRecord
from app.database.repositories.analysis_repository import AnalysisRepository
from app.database.repositories.tool_repository import ToolRepository
from app.storage.image_storage import ImageStorage

logger = logging.getLogger(__name__)


def _preview_image_type() -> str | None:
    """Выбирает тип картинки для превью истории с учётом analysis_pipeline."""
    settings = APP_SETTINGS["analysis_pipeline"]
    if settings["save_final_objects"]:
        return "overlay"
    if settings["save_postprocessed_mask"]:
        return "postprocessed"
    if settings["save_segmentation_mask"]:
        return "segmentation"
    if settings["save_intermediate_results"]:
        return "preprocessed"
    return None


def _run_status(run: HistoryRunRecord, storage: ImageStorage) -> str:
    """Уточняет сохранённый статус запуска по наличию оригинального файла.

    В историю попадают только успешно завершённые запуски, поэтому в БД
    обычно записан SUCCESS. Если оригинал изображения удалён или находится
    вне зарегистрированных хранилищ, запуск помечается как FAILED, чтобы
    битая карточка истории не выглядела успешной.
    """
    if run.status != "SUCCESS":
        return run.status

    try:
        original = storage.resolve_path(run.file_path)
    except ValueError:
        return "FAILED"

    return "SUCCESS" if original.is_file() else "FAILED"


def list_history(
    analysis_repository: AnalysisRepository,
    tool_repository: ToolRepository,
    storage: ImageStorage,
) -> list[dict]:
    """Список всех запусков анализа для таблицы истории."""
    model_names = {
        model.model_id: model.model_name for model in tool_repository.get_all()
    }

    history = []
    preview_type = _preview_image_type()
    for run in analysis_repository.get_all_runs():
        status = _run_status(run, storage)
        error = run.error_message
        if status == "FAILED" and not error:
            error = (
                "Файл оригинала недоступен"
                if run.status == "SUCCESS"
                else "Анализ завершился с ошибкой"
            )

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
                "duration": round(run.duration, 3),
                "width": run.width,
                "height": run.height,
                "status": status,
                "error": error,
                "previewUrl": (
                    f"/analysis/{run.run_id}/images/{preview_type}"
                    if status == "SUCCESS" and preview_type is not None
                    else None
                ),
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
