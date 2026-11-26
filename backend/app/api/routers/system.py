"""Служебные эндпоинты: проверка доступности и заглушка списка моделей."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def root() -> dict[str, str]:
    """Корневой эндпоинт для быстрой проверки, что сервер запущен."""
    return {"status": "ok"}


@router.get("/health")
def health() -> dict[str, str]:
    """Health-check, который используют лаунчер и внешние проверки."""
    return {"status": "ok"}


@router.get("/v1/models")
def models() -> dict[str, str]:
    """Заглушка OpenAI-совместимого списка моделей."""
    return {"status": "ok"}
