"""Чтение, валидация и сохранение глобальных настроек приложения."""

import copy
import logging
import threading
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.config.config_loader import (
    APP_SETTINGS,
    CONFIG_PATH,
    resolve_images_directory,
    write_settings_file,
)
from app.schemas.settings_schema import AppSettings

logger = logging.getLogger(__name__)
_LOCK = threading.RLock()


class SettingsValidationError(ValueError):
    """Ошибка валидации или применения настроек."""


def _now_iso() -> str:
    return datetime.now(tz=UTC).isoformat(timespec="seconds")


def read_settings() -> dict[str, Any]:
    """Возвращает глубокую копию текущих настроек.

    Если файл настроек удалили при работающем backend, он восстанавливается
    из активных значений, чтобы приложение продолжало работать штатно.
    """
    with _LOCK:
        if not CONFIG_PATH.is_file():
            try:
                write_settings_file(APP_SETTINGS, CONFIG_PATH)
            except OSError:
                logger.exception(
                    "Не удалось восстановить отсутствующий файл настроек %s",
                    CONFIG_PATH,
                )

        return copy.deepcopy(APP_SETTINGS)


def get_settings_envelope(settings: dict[str, Any] | None = None) -> dict[str, Any]:
    """Данные для UI: настройки, путь к файлу и фактическая папка изображений."""
    current = read_settings() if settings is None else copy.deepcopy(settings)
    images_directory = current.get("storage", {}).get(
        "images_directory", "data/images"
    )
    resolved = resolve_images_directory(images_directory)

    return {
        "settings": current,
        "config_path": str(CONFIG_PATH),
        # Значение, сохранённое в settings.json (может быть относительным).
        "images_directory": images_directory,
        # Абсолютный путь, который реально использует backend.
        "resolved_images_directory": str(resolved),
        "updated_at": _now_iso(),
    }


def _validate_images_directory(value: str) -> Path:
    """Проверяет и при необходимости создаёт папку для изображений."""
    try:
        path = resolve_images_directory(value)
    except (OSError, ValueError) as exc:
        raise SettingsValidationError(f"Некорректный путь к изображениям: {exc}") from exc

    if path.exists() and not path.is_dir():
        raise SettingsValidationError(
            f"Путь к изображениям указывает на файл, а не на папку: {path}"
        )

    try:
        path.mkdir(parents=True, exist_ok=True)
    except OSError as exc:
        raise SettingsValidationError(
            f"Не удалось создать папку для изображений: {path} ({exc})"
        ) from exc

    return path


def validate_settings(payload: dict[str, Any] | AppSettings) -> dict[str, Any]:
    """Валидирует настройки и возвращает их как обычный dict."""
    model = (
        payload
        if isinstance(payload, AppSettings)
        else AppSettings.model_validate(payload)
    )
    settings = model.model_dump(mode="python")
    _validate_images_directory(settings["storage"]["images_directory"])
    return settings


def update_settings(payload: dict[str, Any] | AppSettings) -> dict[str, Any]:
    """Валидирует, сохраняет в settings.json и применяет настройки в памяти."""
    validated = validate_settings(payload)

    with _LOCK:
        write_settings_file(validated, CONFIG_PATH)

        # APP_SETTINGS импортирован многими модулями по ссылке. Обновляем
        # содержимое на месте, чтобы они сразу увидели новые значения.
        APP_SETTINGS.clear()
        APP_SETTINGS.update(copy.deepcopy(validated))

    return validated
