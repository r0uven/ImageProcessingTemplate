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
    """Данные для UI: настройки, путь к файлу и состояние реестра хранилищ."""
    current = read_settings() if settings is None else copy.deepcopy(settings)
    storage = current.get("storage", {})
    active_id = storage.get("active_storage_id", "default")
    entries = storage.get("storages", [])

    active_entry = next(
        (entry for entry in entries if entry.get("id") == active_id),
        entries[0] if entries else {"path": "data/images"},
    )
    images_directory = active_entry.get("path", "data/images")
    resolved = resolve_images_directory(images_directory)

    storages = []
    for entry in entries:
        entry_path = entry.get("path", "")
        try:
            entry_resolved = resolve_images_directory(entry_path)
        except (OSError, ValueError):
            entry_resolved = None

        storages.append(
            {
                **entry,
                "resolved_path": str(entry_resolved) if entry_resolved else "",
                "exists": bool(entry_resolved and entry_resolved.is_dir()),
                "is_active": entry.get("id") == active_id,
            }
        )

    return {
        "settings": current,
        "config_path": str(CONFIG_PATH),
        # Значение, сохранённое в settings.json (может быть относительным).
        "images_directory": images_directory,
        # Абсолютный путь, который реально использует backend.
        "resolved_images_directory": str(resolved),
        "active_storage_id": active_id,
        "storages": storages,
        "updated_at": _now_iso(),
    }


def _validate_storage_settings(storage: dict[str, Any]) -> None:
    """Проверяет реестр хранилищ и создаёт папку активного хранилища."""
    entries = storage.get("storages", [])
    if not entries:
        raise SettingsValidationError("Нужно хотя бы одно хранилище изображений")

    ids = [entry.get("id") for entry in entries]
    if len(ids) != len(set(ids)):
        raise SettingsValidationError("Идентификаторы хранилищ должны быть уникальны")

    active_id = storage.get("active_storage_id")
    if active_id not in ids:
        raise SettingsValidationError(
            "Активное хранилище должно присутствовать в списке хранилищ"
        )

    resolved_paths: list[Path] = []
    for entry in entries:
        value = entry.get("path", "")
        try:
            path = resolve_images_directory(value)
        except (OSError, ValueError) as exc:
            raise SettingsValidationError(
                f"Некорректный путь к хранилищу: {exc}"
            ) from exc

        if path.exists() and not path.is_dir():
            raise SettingsValidationError(
                f"Путь к хранилищу указывает на файл, а не на папку: {path}"
            )

        resolved_paths.append(path)

    if len(set(resolved_paths)) != len(resolved_paths):
        raise SettingsValidationError(
            "Разные хранилища не могут указывать на одну и ту же папку"
        )

    for index, first in enumerate(resolved_paths):
        for second in resolved_paths[index + 1 :]:
            if first in second.parents or second in first.parents:
                raise SettingsValidationError(
                    f"Хранилища не должны быть вложены друг в друга: {first} и {second}"
                )

    active_path = resolved_paths[ids.index(active_id)]
    try:
        active_path.mkdir(parents=True, exist_ok=True)
    except OSError as exc:
        raise SettingsValidationError(
            f"Не удалось создать папку хранилища: {active_path} ({exc})"
        ) from exc


def validate_settings(payload: dict[str, Any] | AppSettings) -> dict[str, Any]:
    """Валидирует настройки и возвращает их как обычный dict."""
    model = (
        payload
        if isinstance(payload, AppSettings)
        else AppSettings.model_validate(payload)
    )
    settings = model.model_dump(mode="python")
    _validate_storage_settings(settings["storage"])
    return settings


def update_settings(payload: dict[str, Any] | AppSettings) -> dict[str, Any]:
    """Валидирует, сохраняет в settings.json и применяет настройки в памяти."""
    validated = validate_settings(payload)

    with _LOCK:
        old_active_id = APP_SETTINGS.get("storage", {}).get("active_storage_id")
        new_active_id = validated["storage"]["active_storage_id"]
        if old_active_id != new_active_id:
            for entry in validated["storage"]["storages"]:
                if entry["id"] == new_active_id:
                    entry["last_used_at"] = _now_iso()
                    break

        write_settings_file(validated, CONFIG_PATH)

        # APP_SETTINGS импортирован многими модулями по ссылке. Обновляем
        # содержимое на месте, чтобы они сразу увидели новые значения.
        APP_SETTINGS.clear()
        APP_SETTINGS.update(copy.deepcopy(validated))

    return validated
