"""Управление реестром хранилищ изображений.

Активное хранилище используется для записи новых файлов. Остальные
зарегистрированные хранилища доступны только для чтения: история, превью и
результаты анализа продолжают работать после переключения.

Реестр хранится в ``settings.json`` (``storage.storages``), поэтому переживает
перезапуск приложения. Старые папки, на которые ещё ссылается база данных,
автоматически добавляются в реестр при старте.
"""

from __future__ import annotations

import logging
import os
import shutil
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.config.config_loader import (
    BASE_DIR,
    DEFAULT_IMAGES_DIRECTORY,
    resolve_images_directory,
)
from app.config.settings_service import read_settings, update_settings
from app.database.repositories.analysis_repository import AnalysisRepository
from app.database.repositories.image_repository import ImageRepository
from app.storage.image_storage import ImageStorage

logger = logging.getLogger(__name__)


class StorageError(ValueError):
    """Ошибка операции с хранилищем."""


class StorageConflictError(StorageError):
    """Операция конфликтует с существующими данными."""


def _now_iso() -> str:
    return datetime.now(tz=UTC).isoformat(timespec="seconds")


def _entries(settings: dict[str, Any]) -> list[dict[str, Any]]:
    return settings["storage"]["storages"]


def _find_entry(
    entries: list[dict[str, Any]], storage_id: str
) -> dict[str, Any] | None:
    return next((entry for entry in entries if entry.get("id") == storage_id), None)


def _resolved_path(entry: dict[str, Any]) -> Path:
    try:
        return resolve_images_directory(entry.get("path", ""))
    except (OSError, ValueError) as exc:
        raise StorageError(f"Некорректный путь хранилища: {exc}") from exc


def _infer_storage_root(file_path: str) -> Path | None:
    """Определяет корень хранилища по абсолютному пути файла из БД."""
    path = Path(file_path)
    if not path.is_absolute():
        return None

    parts = path.parts
    for marker in ("originals", "previews", "analysis"):
        if marker not in parts:
            continue

        index = len(parts) - 1 - parts[::-1].index(marker)
        if index <= 0:
            return None

        return Path(*parts[:index])

    return None


def _directory_stats(root: Path) -> tuple[int, int]:
    """Возвращает количество файлов и суммарный размер папки."""
    file_count = 0
    total_bytes = 0

    if not root.is_dir():
        return 0, 0

    for dir_path, _dir_names, file_names in os.walk(root, onerror=lambda _exc: None):
        for name in file_names:
            try:
                stat = os.stat(os.path.join(dir_path, name))
            except OSError:
                continue

            file_count += 1
            total_bytes += stat.st_size

    return file_count, total_bytes


def _count_images_by_root(
    storage: ImageStorage, image_repository: ImageRepository
) -> dict[str, int]:
    counts: dict[str, int] = {}

    for image in image_repository.get_all():
        root = storage.storage_root_for_path(image.file_path)
        if root is None:
            continue

        key = str(root)
        counts[key] = counts.get(key, 0) + 1

    return counts


def _storage_info(
    entry: dict[str, Any],
    *,
    active_id: str,
    image_counts: dict[str, int],
    include_stats: bool,
) -> dict[str, Any]:
    try:
        root = _resolved_path(entry)
    except StorageError:
        root = Path(entry.get("path", ""))

    exists = root.is_dir()
    file_count, size_bytes = _directory_stats(root) if include_stats else (0, 0)

    return {
        "id": entry.get("id", ""),
        "path": entry.get("path", ""),
        "resolved_path": str(root),
        "label": entry.get("label", ""),
        "created_at": entry.get("created_at"),
        "last_used_at": entry.get("last_used_at"),
        "is_active": entry.get("id") == active_id,
        "exists": exists,
        "image_count": image_counts.get(str(root), 0),
        "file_count": file_count,
        "size_bytes": size_bytes,
    }


def list_storage_infos(
    storage: ImageStorage,
    image_repository: ImageRepository,
    *,
    include_stats: bool = True,
) -> list[dict[str, Any]]:
    """Возвращает реестр хранилищ с количеством изображений и размером."""
    settings = read_settings()
    storage_settings = settings["storage"]
    active_id = storage_settings["active_storage_id"]
    image_counts = _count_images_by_root(storage, image_repository)

    return [
        _storage_info(
            entry,
            active_id=active_id,
            image_counts=image_counts,
            include_stats=include_stats,
        )
        for entry in storage_settings["storages"]
    ]


def _assert_unique_root(
    entries: list[dict[str, Any]],
    root: Path,
    *,
    exclude_id: str | None = None,
) -> None:
    for entry in entries:
        if exclude_id is not None and entry.get("id") == exclude_id:
            continue

        other = _resolved_path(entry)
        if root == other:
            raise StorageConflictError(
                f"Эта папка уже используется хранилищем «{entry.get('label') or other}»"
            )

        if root in other.parents or other in root.parents:
            raise StorageConflictError(
                f"Хранилища не должны быть вложены друг в друга: {root} и {other}"
            )


def _apply_and_list(
    settings: dict[str, Any],
    storage: ImageStorage,
    image_repository: ImageRepository,
) -> list[dict[str, Any]]:
    saved = update_settings(settings)
    storage.apply_settings(saved, config_changed=True)
    return list_storage_infos(storage, image_repository)


def add_storage(
    storage: ImageStorage,
    image_repository: ImageRepository,
    *,
    path: str,
    label: str = "",
    activate: bool = False,
) -> list[dict[str, Any]]:
    """Регистрирует новую папку хранилища."""
    settings = read_settings()
    entries = _entries(settings)
    root = _resolved_path({"path": path})

    if root.exists() and not root.is_dir():
        raise StorageError(f"Путь указывает на файл, а не на папку: {root}")

    _assert_unique_root(entries, root)

    entry = {
        "id": uuid.uuid4().hex,
        "path": path.strip(),
        "label": label.strip(),
        "created_at": _now_iso(),
        "last_used_at": None,
    }
    entries.append(entry)

    if activate or len(entries) == 1:
        settings["storage"]["active_storage_id"] = entry["id"]
        entry["last_used_at"] = _now_iso()

    return _apply_and_list(settings, storage, image_repository)


def activate_storage(
    storage: ImageStorage,
    image_repository: ImageRepository,
    storage_id: str,
) -> list[dict[str, Any]]:
    """Делает хранилище активным для новых загрузок."""
    settings = read_settings()
    entries = _entries(settings)
    entry = _find_entry(entries, storage_id)
    if entry is None:
        raise StorageError("Хранилище не найдено")

    root = _resolved_path(entry)
    if root.exists() and not root.is_dir():
        raise StorageError(f"Путь указывает на файл, а не на папку: {root}")

    settings["storage"]["active_storage_id"] = storage_id
    entry["last_used_at"] = _now_iso()

    return _apply_and_list(settings, storage, image_repository)


def update_storage(
    storage: ImageStorage,
    image_repository: ImageRepository,
    storage_id: str,
    *,
    path: str | None = None,
    label: str | None = None,
) -> list[dict[str, Any]]:
    """Меняет название или путь хранилища.

    Смена пути считается «переездом» папки: все абсолютные пути в БД
    переписываются на новый корень. Если файлы не найдены, операция
    отменяется, чтобы не потерять историю.
    """
    settings = read_settings()
    entries = _entries(settings)
    entry = _find_entry(entries, storage_id)
    if entry is None:
        raise StorageError("Хранилище не найдено")

    if label is not None:
        entry["label"] = label.strip()

    if path is not None and path.strip() != entry.get("path"):
        old_root = _resolved_path(entry)
        new_root = _resolved_path({"path": path})

        if new_root.exists() and not new_root.is_dir():
            raise StorageError(f"Путь указывает на файл, а не на папку: {new_root}")

        _assert_unique_root(entries, new_root, exclude_id=storage_id)

        images = [
            image
            for image in image_repository.get_all()
            if storage.storage_root_for_path(image.file_path) == old_root
        ]

        updates: list[tuple[str, str]] = []
        missing = 0

        for image in images:
            try:
                old_path = storage.resolve_path(image.file_path)
                relative = old_path.relative_to(old_root)
            except (OSError, ValueError):
                continue

            target = (new_root / relative).resolve()
            if not target.is_file():
                missing += 1
                continue

            updates.append((image.image_id, str(target)))

        if missing:
            raise StorageError(
                f"В новой папке не найдено файлов: {missing}. "
                "Сначала переместите папку целиком, затем укажите новый путь."
            )

        for image_id, file_path in updates:
            image_repository.update_file_path(image_id, file_path)

        entry["path"] = path.strip()

    return _apply_and_list(settings, storage, image_repository)


def _safe_to_remove(root: Path) -> bool:
    """Не даёт удалить корень диска, домашнюю папку или backend."""
    resolved = root.resolve()
    if resolved == Path(resolved.anchor):
        return False
    if resolved == Path.home().resolve():
        return False
    return not (
        resolved == BASE_DIR.resolve() or BASE_DIR.resolve() in resolved.parents
    )


def delete_storage(
    storage: ImageStorage,
    image_repository: ImageRepository,
    analysis_repository: AnalysisRepository,
    storage_id: str,
    *,
    delete_files: bool = False,
    delete_history: bool = False,
) -> list[dict[str, Any]]:
    """Удаляет хранилище из реестра.

    Если на хранилище ссылается история, требуется ``delete_history=True``.
    Удаление файлов выполняется только при явном ``delete_files=True``.
    """
    settings = read_settings()
    entries = _entries(settings)
    entry = _find_entry(entries, storage_id)
    if entry is None:
        raise StorageError("Хранилище не найдено")

    if len(entries) <= 1:
        raise StorageConflictError("Нельзя удалить единственное хранилище")

    if settings["storage"]["active_storage_id"] == storage_id:
        raise StorageConflictError(
            "Сначала сделайте активным другое хранилище, затем удалите это"
        )

    root = _resolved_path(entry)
    images = [
        image
        for image in image_repository.get_all()
        if storage.storage_root_for_path(image.file_path) == root
    ]

    if images and not delete_history:
        raise StorageConflictError(
            f"В хранилище {len(images)} изображений. "
            "Удалите их вместе с историей или сначала очистите историю."
        )

    if delete_files and not _safe_to_remove(root):
        raise StorageError(
            f"Удаление папки {root} запрещено: это системная папка или папка приложения"
        )

    if delete_history:
        for image in images:
            for run_id in analysis_repository.get_run_ids_by_image(image.image_id):
                analysis_repository.delete_run(run_id)
                storage.delete_analysis_images(run_id)

            image_repository.delete(image.image_id)

    entries.remove(entry)
    saved = update_settings(settings)
    storage.apply_settings(saved, config_changed=True)

    if delete_files and root.is_dir():
        try:
            shutil.rmtree(root)
        except OSError:
            logger.exception("Failed to remove storage directory: %s", root)

    logger.info(
        "Storage deleted: id=%s root=%s files=%s history=%s",
        storage_id,
        root,
        delete_files,
        delete_history,
    )

    return list_storage_infos(storage, image_repository)


def reconcile_storages(
    storage: ImageStorage,
    image_repository: ImageRepository,
) -> None:
    """Добавляет в реестр старые папки, на которые ссылается БД.

    Это лечит состояние, возникшее до появления реестра: в settings.json
    остался только последний путь, а изображения из предыдущих папок
    продолжали лежать на диске.
    """
    settings = read_settings()
    storage_settings = settings["storage"]
    entries = storage_settings["storages"]
    known: set[str] = set()

    for entry in entries:
        try:
            resolved = _resolved_path(entry)
        except StorageError:
            logger.warning("Skipping invalid storage entry: %s", entry)
            continue

        known.add(str(resolved))

        if not resolved.is_dir():
            logger.warning(
                "Storage directory is unavailable: %s (%s)",
                resolved,
                entry.get("label") or entry.get("id"),
            )

    changed = False

    for image in image_repository.get_all():
        root = _infer_storage_root(image.file_path)
        if root is None:
            continue

        key = str(root)
        if key in known:
            continue

        entries.append(
            {
                "id": uuid.uuid4().hex,
                "path": str(root),
                "label": (
                    f"Восстановлено: {root.name or root}"
                    if root.is_dir()
                    else f"Недоступно: {root}"
                ),
                "created_at": _now_iso(),
                "last_used_at": None,
            }
        )
        known.add(key)
        changed = True
        logger.info("Storage discovered from database: %s", root)

    default_root = (BASE_DIR / DEFAULT_IMAGES_DIRECTORY).resolve()
    if str(default_root) not in known and default_root.is_dir():
        try:
            has_files = any(default_root.iterdir())
        except OSError:
            has_files = False

        if has_files:
            entries.append(
                {
                    "id": uuid.uuid4().hex,
                    "path": DEFAULT_IMAGES_DIRECTORY,
                    "label": "Папка по умолчанию",
                    "created_at": _now_iso(),
                    "last_used_at": None,
                }
            )
            known.add(str(default_root))
            changed = True

    active_id = storage_settings.get("active_storage_id")
    active_entry = _find_entry(entries, active_id) if active_id else None
    active_root: Path | None = None
    if active_entry is not None:
        try:
            active_root = _resolved_path(active_entry)
        except StorageError:
            active_root = None

    if active_entry is None or active_root is None or not active_root.is_dir():
        existing = []
        for entry in entries:
            try:
                if _resolved_path(entry).is_dir():
                    existing.append(entry)
            except StorageError:
                continue
        if existing:
            storage_settings["active_storage_id"] = existing[0]["id"]
        else:
            default_entry = _find_entry(entries, "default")
            if default_entry is None:
                entries.append(
                    {
                        "id": "default",
                        "path": DEFAULT_IMAGES_DIRECTORY,
                        "label": "Основное хранилище",
                        "created_at": _now_iso(),
                        "last_used_at": _now_iso(),
                    }
                )
            storage_settings["active_storage_id"] = entries[0]["id"]

        changed = True

    if not changed:
        return

    try:
        saved = update_settings(settings)
        storage.apply_settings(saved, config_changed=True)
        logger.info("Storage registry reconciled")
    except ValueError:
        logger.exception("Failed to reconcile storage registry")
    except OSError:
        logger.exception("Failed to save reconciled storage registry")
