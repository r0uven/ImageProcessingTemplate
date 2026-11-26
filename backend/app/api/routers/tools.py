"""Эндпоинты справочника моделей сегментации (инструментов)."""

import logging
from typing import Annotated

from fastapi import APIRouter, Header, HTTPException

from app.api.constants import DELETE_CONFIRMATION_HEADER
from app.api.dependencies import ToolRepositoryDep

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tools")


@router.get("")
def get_tools(tool_repository: ToolRepositoryDep):
    """Возвращает все доступные модели: встроенные и добавленные пользователем."""
    return tool_repository.get_all()


@router.delete("/{model_id}", status_code=204)
def delete_tool(
    model_id: str,
    tool_repository: ToolRepositoryDep,
    confirmation: Annotated[
        str | None, Header(alias=DELETE_CONFIRMATION_HEADER)
    ] = None,
) -> None:
    """Удаляет модель только при явном подтверждении и если она removable."""
    # Заголовок должен дословно совпадать с id: это защита от случайного удаления.
    if confirmation != model_id:
        raise HTTPException(
            status_code=428,
            detail=(
                "Deletion must be confirmed: "
                f"pass header {DELETE_CONFIRMATION_HEADER}: {model_id}"
            ),
        )

    tool = tool_repository.get_by_id(model_id)
    if tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")

    if not tool.removable:
        raise HTTPException(
            status_code=403,
            detail="Tool is protected from deletion",
        )

    try:
        deleted = tool_repository.delete(model_id)
    except Exception as exc:
        logger.exception("Failed to delete tool: %s", model_id)
        raise HTTPException(
            status_code=409,
            detail="Tool cannot be deleted because it is in use",
        ) from exc

    if not deleted:
        raise HTTPException(status_code=409, detail="Tool cannot be deleted")
