import logging

from fastapi import APIRouter, HTTPException, Request
from pydantic import ValidationError

from app.api.dependencies import AnalysisRepositoryDep, ImageRepositoryDep, StorageDep
from app.config.settings_service import (
    SettingsValidationError,
    get_settings_envelope,
    read_settings,
    update_settings,
)
from app.schemas.settings_schema import (
    AppSettings,
    StorageCreateRequest,
    StorageUpdateRequest,
)
from app.services import storage_registry
from app.services.storage_registry import StorageConflictError, StorageError

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


@router.get("/storages")
def get_storages(
    storage: StorageDep,
    image_repository: ImageRepositoryDep,
) -> list[dict]:
    """Возвращает реестр хранилищ с количеством изображений и размером."""
    return storage_registry.list_storage_infos(storage, image_repository)


@router.post("/storages")
def create_storage(
    payload: StorageCreateRequest,
    storage: StorageDep,
    image_repository: ImageRepositoryDep,
) -> list[dict]:
    """Добавляет новую папку в реестр хранилищ."""
    try:
        return storage_registry.add_storage(
            storage,
            image_repository,
            path=payload.path,
            label=payload.label,
            activate=payload.activate,
        )
    except StorageConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except (StorageError, SettingsValidationError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except OSError as exc:
        logger.exception("Failed to add storage")
        raise HTTPException(
            status_code=500, detail="Не удалось добавить хранилище"
        ) from exc


@router.patch("/storages/{storage_id}")
def patch_storage(
    storage_id: str,
    payload: StorageUpdateRequest,
    storage: StorageDep,
    image_repository: ImageRepositoryDep,
) -> list[dict]:
    """Переименовывает хранилище или указывает новый путь к перемещённой папке."""
    try:
        return storage_registry.update_storage(
            storage,
            image_repository,
            storage_id,
            path=payload.path,
            label=payload.label,
        )
    except StorageConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except (StorageError, SettingsValidationError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except OSError as exc:
        logger.exception("Failed to update storage")
        raise HTTPException(
            status_code=500, detail="Не удалось изменить хранилище"
        ) from exc


@router.post("/storages/{storage_id}/activate")
def activate_storage(
    storage_id: str,
    storage: StorageDep,
    image_repository: ImageRepositoryDep,
) -> list[dict]:
    """Делает хранилище активным для новых загрузок."""
    try:
        return storage_registry.activate_storage(
            storage,
            image_repository,
            storage_id,
        )
    except StorageConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except (StorageError, SettingsValidationError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except OSError as exc:
        logger.exception("Failed to activate storage")
        raise HTTPException(
            status_code=500, detail="Не удалось переключить хранилище"
        ) from exc


@router.delete("/storages/{storage_id}")
def delete_storage(
    storage_id: str,
    storage: StorageDep,
    image_repository: ImageRepositoryDep,
    analysis_repository: AnalysisRepositoryDep,
    delete_files: bool = False,
    delete_history: bool = False,
) -> list[dict]:
    """Удаляет хранилище из реестра.

    ``delete_history`` разрешает удалить связанные записи истории,
    ``delete_files`` — саму папку.
    """
    try:
        return storage_registry.delete_storage(
            storage,
            image_repository,
            analysis_repository,
            storage_id,
            delete_files=delete_files,
            delete_history=delete_history,
        )
    except StorageConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except (StorageError, SettingsValidationError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except OSError as exc:
        logger.exception("Failed to delete storage")
        raise HTTPException(
            status_code=500, detail="Не удалось удалить хранилище"
        ) from exc


@router.get("/raw")
def get_raw_settings() -> dict:
    """Плоский снимок текущих настроек (без служебных полей)."""
    return read_settings()
