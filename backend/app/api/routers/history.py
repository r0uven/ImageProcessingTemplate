from fastapi import APIRouter, HTTPException

from app.api.dependencies import AnalysisRepositoryDep, StorageDep, ToolRepositoryDep
from app.services import history as history_service

router = APIRouter(prefix="/history")


@router.get("")
def get_history(
    analysis_repository: AnalysisRepositoryDep,
    tool_repository: ToolRepositoryDep,
    storage: StorageDep,
) -> list[dict]:
    """Список всех запусков анализа для таблицы истории."""
    return history_service.list_history(
        analysis_repository,
        tool_repository,
        storage,
    )


@router.delete("/{run_id}", status_code=204)
def delete_history_entry(
    run_id: str,
    storage: StorageDep,
    analysis_repository: AnalysisRepositoryDep,
) -> None:
    """Удаляет запуск анализа из истории вместе с его результатами и файлами."""
    if not history_service.delete_history_entry(run_id, storage, analysis_repository):
        raise HTTPException(status_code=404, detail="History entry not found")
