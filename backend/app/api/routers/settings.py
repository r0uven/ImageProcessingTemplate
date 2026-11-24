import logging

from fastapi import APIRouter, HTTPException, Request
from pydantic import ValidationError

from app.config.settings_service import (
    SettingsValidationError,
    get_settings_envelope,
    read_settings,
    update_settings,
)
from app.schemas.settings_schema import AppSettings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
def get_settings() -> dict:
    """Возвращает глобальные настройки и служебные пути."""
    return get_settings_envelope()


@router.put("")
def save_settings(settings: AppSettings, request: Request) -> dict:
    """Сохраняет настройки в settings.json и применяет их без перезапуска."""
    try:
        saved = update_settings(settings)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    except SettingsValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except OSError as exc:
        logger.exception("Failed to write settings")
        raise HTTPException(
            status_code=500, detail="Не удалось сохранить настройки"
        ) from exc

    storage = getattr(request.app.state, "storage", None)
    if storage is not None:
        storage.apply_settings(saved, config_changed=True)

    logger.info("Global settings updated")
    return get_settings_envelope(saved)


@router.get("/raw")
def get_raw_settings() -> dict:
    """Плоский снимок текущих настроек (без служебных полей)."""
    return read_settings()
