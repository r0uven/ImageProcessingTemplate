"""Загрузка, нормализация и сохранение ``settings.json``."""

import copy
import json
import logging
import os
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.config.default_settings import default_settings

logger = logging.getLogger(__name__)

CONFIG_PATH = Path(__file__).with_name("settings.json")

# Секции settings.json, которые влияют на результат анализа, но не приходят
# в AnalyzeRequest. Используются и в хеше запуска, и в снимке параметров,
# чтобы оба места всегда учитывали одинаковый набор настроек.
RESULT_SETTINGS_SECTIONS = (
    "image",
    "postprocessing",
    "object_detection",
    "feature_extraction",
)

# Корень backend-приложения. Относительные пути из settings.json
# (например, storage.storages[].path) считаются от него.
BASE_DIR = Path(__file__).resolve().parents[2]

DEFAULT_IMAGES_DIRECTORY = "data/images"


def resolve_backend_path(value: str | Path) -> Path:
    """Преобразует путь из настроек в абсолютный путь внутри backend."""
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = BASE_DIR / path
    return path.resolve()


def resolve_images_directory(value: str | Path | None = None) -> Path:
    """Возвращает абсолютную директорию конкретного хранилища.

    Без аргумента берётся активное хранилище из реестра ``storage.storages``.
    """
    if value is None:
        storage = APP_SETTINGS.get("storage", {})
        active_id = storage.get("active_storage_id")
        entries = storage.get("storages", [])

        for entry in entries:
            if isinstance(entry, dict) and entry.get("id") == active_id:
                value = entry.get("path")
                break

        if value is None and entries:
            first = entries[0]
            value = first.get("path") if isinstance(first, dict) else None

        if value is None:
            value = DEFAULT_IMAGES_DIRECTORY

    return resolve_backend_path(value)


def _storage_timestamp() -> str:
    """Текущее время в формате, который используется в реестре хранилищ."""
    return datetime.now(tz=UTC).isoformat(timespec="seconds")


def _migrate_storage_settings(
    settings: dict[str, Any],
    *,
    legacy_path: str | None = None,
    had_storages: bool = False,
) -> bool:
    """Приводит старую настройку ``storage.images_directory`` к реестру.

    Возвращает ``True``, если файл настроек нужно перезаписать.
    """
    storage = settings.get("storage")
    if not isinstance(storage, dict):
        return False

    changed = False
    stored_legacy = storage.pop("images_directory", None)
    if stored_legacy is not None:
        changed = True

    if legacy_path is None:
        legacy_path = stored_legacy

    storages = storage.get("storages")

    if not had_storages and legacy_path:
        # В старом формате был только один путь. Список, пришедший из
        # дефолтов при слиянии, не должен затирать пользовательское значение.
        storages = []

    normalized: list[dict[str, Any]] = []

    if isinstance(storages, list):
        for index, entry in enumerate(storages):
            if not isinstance(entry, dict):
                continue

            item = dict(entry)
            item.setdefault("id", f"storage-{index + 1}")
            item.setdefault("path", DEFAULT_IMAGES_DIRECTORY)
            item.setdefault("label", "")
            item.setdefault("created_at", None)
            item.setdefault("last_used_at", None)
            normalized.append(item)

    if not normalized:
        now = _storage_timestamp()
        normalized = [
            {
                "id": "default",
                "path": legacy_path or DEFAULT_IMAGES_DIRECTORY,
                "label": "Основное хранилище",
                "created_at": now,
                "last_used_at": now,
            }
        ]
        changed = True

    if normalized != storages:
        storage["storages"] = normalized
        changed = True

    ids = {str(entry["id"]) for entry in normalized}
    active_id = storage.get("active_storage_id")
    if not active_id or active_id not in ids:
        storage["active_storage_id"] = normalized[0]["id"]
        changed = True

    return changed


def _merge_settings(
    defaults: dict[str, Any],
    loaded: dict[str, Any],
) -> dict[str, Any]:
    """Добирает отсутствующие поля из дефолтов, сохраняя значения файла."""
    merged = copy.deepcopy(defaults)
    for key, value in loaded.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = _merge_settings(merged[key], value)
        else:
            merged[key] = copy.deepcopy(value)
    return merged


def write_settings_file(
    settings: dict[str, Any],
    path: str | Path = CONFIG_PATH,
) -> None:
    """Атомарно записывает настройки в JSON-файл."""
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)

    fd, tmp_name = tempfile.mkstemp(
        prefix=f"{target.name}.",
        suffix=".tmp",
        dir=target.parent,
        text=True,
    )
    tmp_path = Path(tmp_name)

    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as file:
            json.dump(settings, file, ensure_ascii=False, indent=2)
            file.write("\n")
            file.flush()
            os.fsync(file.fileno())
        os.replace(tmp_path, target)
    except BaseException:
        tmp_path.unlink(missing_ok=True)
        raise


def _backup_broken_file(path: Path) -> None:
    """Сохраняет повреждённый файл рядом, чтобы его можно было изучить."""
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    backup = path.with_name(f"{path.name}.broken-{timestamp}")

    try:
        os.replace(path, backup)
    except OSError:
        logger.exception("Не удалось сохранить копию повреждённого файла %s", path)
        return

    logger.warning("Повреждённый файл настроек сохранён как %s", backup)


def _restore_defaults(path: Path) -> dict[str, Any]:
    """Возвращает дефолты и пытается записать их в файл."""
    settings = default_settings()

    try:
        write_settings_file(settings, path)
    except OSError:
        # Приложение должно запуститься даже при недоступной для записи папке.
        logger.exception(
            "Не удалось создать файл настроек %s; используются значения "
            "по умолчанию только в памяти",
            path,
        )

    return settings


def load_settings(path: str | Path = CONFIG_PATH) -> dict[str, Any]:
    """Читает настройки, создавая файл из дефолтов при его отсутствии."""
    target = Path(path)

    if not target.is_file():
        logger.warning(
            "Файл настроек %s не найден — создаю значения по умолчанию",
            target,
        )
        return _restore_defaults(target)

    try:
        loaded = json.loads(target.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        logger.error("Не удалось прочитать настройки из %s: %s", target, exc)
        _backup_broken_file(target)
        return _restore_defaults(target)

    if not isinstance(loaded, dict):
        logger.error("Файл настроек %s должен содержать JSON-объект", target)
        _backup_broken_file(target)
        return _restore_defaults(target)

    settings = _merge_settings(default_settings(), loaded)

    loaded_storage = loaded.get("storage")
    legacy_storage = loaded_storage if isinstance(loaded_storage, dict) else {}
    migration_changed = _migrate_storage_settings(
        settings,
        legacy_path=legacy_storage.get("images_directory"),
        had_storages="storages" in legacy_storage,
    )

    if migration_changed:
        try:
            write_settings_file(settings, target)
        except OSError:
            logger.exception(
                "Не удалось сохранить обновлённый формат настроек в %s", target
            )

    return settings


def ensure_settings_file(path: str | Path = CONFIG_PATH) -> dict[str, Any]:
    """Возвращает настройки, гарантируя наличие файла settings.json."""
    return load_settings(path)


APP_SETTINGS = ensure_settings_file()
