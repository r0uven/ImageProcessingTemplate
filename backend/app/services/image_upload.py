import logging
import uuid
from collections.abc import Callable
from pathlib import Path

import numpy as np
from fastapi import HTTPException
from fastapi.concurrency import run_in_threadpool
from PIL import Image

from app.api.responses import upload_response
from app.database.models import ImageModel
from app.database.repositories.image_repository import ImageRepository
from app.modules.image_loader.image_loader import ImageLoader
from app.storage.image_storage import ImageStorage

logger = logging.getLogger(__name__)


def remove_files(*paths: Path) -> None:
    for path in paths:
        try:
            path.unlink(missing_ok=True)
        except OSError:
            logger.warning("Failed to remove file: %s", path)


def source_image_path(raw_path: str) -> Path:
    """Проверяет путь, полученный из файлового менеджера на компьютере."""
    if not raw_path or not raw_path.strip():
        raise HTTPException(status_code=400, detail="File path is required")

    try:
        path = Path(raw_path.strip()).expanduser()
    except (OSError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Invalid file path") from exc

    if not path.is_absolute():
        raise HTTPException(status_code=400, detail="Absolute file path is required")

    try:
        is_file = path.is_file()
    except (OSError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Invalid file path") from exc

    if not is_file:
        raise HTTPException(status_code=404, detail="Source image not found")

    return path


def _restore_original(
    existing: ImageModel,
    image_bytes: bytes,
    suffix: str,
    storage: ImageStorage,
) -> Path:
    """Записывает оригинал из переданных байтов заново."""
    logger.warning("Original file missing, restoring: image_id=%s", existing.image_id)

    try:
        return storage.save_original(existing.image_id, image_bytes, suffix)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Unsupported file type") from exc


def _restore_original_from_path(
    existing: ImageModel,
    source_path: Path,
    suffix: str,
    storage: ImageStorage,
) -> Path:
    """Копирует оригинал из файловой системы заново."""
    logger.warning("Original file missing, restoring: image_id=%s", existing.image_id)

    try:
        return storage.copy_original(existing.image_id, source_path, suffix)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Source image not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Unsupported file type") from exc
    except OSError as exc:
        raise HTTPException(
            status_code=500, detail="Failed to copy source image"
        ) from exc


def _sync_existing_original(
    existing: ImageModel,
    storage: ImageStorage,
    image_repository: ImageRepository,
    restore_original: Callable[[], Path],
) -> Path:
    """Возвращает актуальный путь к оригиналу, восстанавливая файл при необходимости."""
    existing_path = storage.resolve_path(existing.file_path)
    if not existing_path.is_file():
        existing_path = restore_original()

    if str(existing_path) != existing.file_path:
        image_repository.update_file_path(existing.image_id, str(existing_path))

    return existing_path


def _update_original_name(
    existing: ImageModel,
    original_image_name: str,
    image_repository: ImageRepository,
) -> None:
    if existing.original_image_name != original_image_name:
        image_repository.update_original_image_name(
            existing.image_id, original_image_name
        )


def _persist_image(
    image_id: str,
    file_path: Path,
    original_image: np.ndarray,
    preview: Image.Image,
    content_hash: str,
    original_image_name: str,
    storage: ImageStorage,
    image_repository: ImageRepository,
) -> dict:
    """Сохраняет превью и метаданные изображения как одну операцию.

    Файл оригинала уже копируется до вызова этой функции. Если запись
    превью или БД не удалась, удаляем оба созданных файла, чтобы не оставлять
    сиротские данные на диске.
    """
    try:
        storage.save_preview(image_id, preview)
        image_repository.create(
            ImageModel(
                image_id=image_id,
                file_path=str(file_path),
                width=int(original_image.shape[1]),
                height=int(original_image.shape[0]),
                # TODO(images.scale_value): масштаб конкретного изображения
                # пока не задаётся, поэтому всегда 1.0. Когда появится
                # per-image масштаб, брать его из запроса загрузки/настроек
                # и писать сюда (сейчас используется только глобальный
                # feature_extraction.scale_mm_per_pixel).
                scale_value=1.0,
                content_hash=content_hash,
                original_image_name=original_image_name,
            )
        )
    except Exception as exc:
        logger.exception("Failed to persist image: %s", original_image_name)
        remove_files(file_path, storage.preview_path(image_id))
        raise HTTPException(status_code=500, detail="Failed to store image") from exc

    return upload_response(image_id, preview)


class ImageUploadService:
    def __init__(
        self,
        storage: ImageStorage,
        loader: ImageLoader,
        image_repository: ImageRepository,
    ):
        self.storage = storage
        self.loader = loader
        self.image_repository = image_repository

    async def upload_bytes(self, filename: str, image_bytes: bytes) -> dict:
        """Сохраняет изображение из байтов; дубликат возвращается по хэшу."""
        if not filename:
            raise HTTPException(status_code=400, detail="Filename is required")

        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        try:
            original_image, preview_image = await run_in_threadpool(
                self.loader.load_image, image_bytes, filename
            )
        except Exception as exc:
            logger.exception("Failed to load image: %s", filename)
            raise HTTPException(status_code=400, detail="Invalid image file") from exc

        content_hash = self.storage.compute_hash(image_bytes)
        suffix = Path(filename).suffix or ".png"
        existing = self.image_repository.get_by_hash(content_hash)
        if existing is not None:
            return await run_in_threadpool(
                self._reuse_existing_image,
                existing,
                filename,
                preview_image,
                image_bytes,
                suffix,
            )

        image_id = str(uuid.uuid4())
        try:
            file_path = await run_in_threadpool(
                self.storage.save_original, image_id, image_bytes, suffix
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=400, detail="Unsupported file type"
            ) from exc

        logger.info("Image uploaded: image_id=%s filename=%s", image_id, filename)
        return await run_in_threadpool(
            _persist_image,
            image_id,
            file_path,
            original_image,
            preview_image,
            content_hash,
            filename,
            self.storage,
            self.image_repository,
        )

    async def upload_path(self, raw_path: str) -> dict:
        """Копирует изображение с локального диска во внутреннее хранилище.

        Фронтенд передаёт только путь к файлу, поэтому байты большого изображения
        не проходят через HTTP. Копия делается потоково, без загрузки файла в память.
        """
        source_path = source_image_path(raw_path)
        filename = source_path.name
        suffix = source_path.suffix or ".png"

        # Сначала считаем хэш исходного файла и проверяем кэш. Копирование
        # в originals выполняется только для действительно нового изображения.
        try:
            content_hash = await run_in_threadpool(
                self.storage.compute_file_hash, source_path
            )
        except FileNotFoundError as exc:
            raise HTTPException(
                status_code=404, detail="Source image not found"
            ) from exc
        except OSError as exc:
            logger.exception("Failed to read image: %s", source_path)
            raise HTTPException(
                status_code=500, detail="Failed to read source image"
            ) from exc

        existing = self.image_repository.get_by_hash(content_hash)
        if existing is not None:
            return await self._reuse_existing_image_from_path(
                existing, source_path, suffix, filename
            )

        image_id = str(uuid.uuid4())

        try:
            file_path = await run_in_threadpool(
                self.storage.copy_original, image_id, source_path, suffix
            )
        except FileNotFoundError as exc:
            raise HTTPException(
                status_code=404, detail="Source image not found"
            ) from exc
        except ValueError as exc:
            raise HTTPException(
                status_code=400, detail="Unsupported file type"
            ) from exc
        except OSError as exc:
            logger.exception("Failed to copy image: %s", source_path)
            raise HTTPException(
                status_code=500, detail="Failed to copy source image"
            ) from exc

        try:
            original_image, preview_image = await run_in_threadpool(
                self.loader.load_image_from_path, file_path
            )
        except Exception as exc:
            logger.exception("Failed to load image: %s", source_path)
            remove_files(file_path)
            raise HTTPException(status_code=400, detail="Invalid image file") from exc

        logger.info(
            "Image imported from path: image_id=%s filename=%s source=%s",
            image_id,
            filename,
            source_path,
        )
        return await run_in_threadpool(
            _persist_image,
            image_id,
            file_path,
            original_image,
            preview_image,
            content_hash,
            filename,
            self.storage,
            self.image_repository,
        )

    def _reuse_existing_image(
        self,
        existing: ImageModel,
        original_image_name: str,
        preview: Image.Image,
        image_bytes: bytes,
        suffix: str,
    ) -> dict:
        """Возвращает уже загруженное изображение, восстанавливая оригинал при необходимости."""
        existing_path = _sync_existing_original(
            existing,
            self.storage,
            self.image_repository,
            lambda: _restore_original(existing, image_bytes, suffix, self.storage),
        )
        _update_original_name(existing, original_image_name, self.image_repository)

        root = self.storage.storage_root_for_path(existing_path)
        self.storage.save_preview(existing.image_id, preview, root)
        logger.info("Image already exists: image_id=%s", existing.image_id)
        return upload_response(existing.image_id, preview)

    async def _reuse_existing_image_from_path(
        self,
        existing: ImageModel,
        source_path: Path,
        suffix: str,
        original_image_name: str,
    ) -> dict:
        """Возвращает уже загруженное изображение, не декодируя дубликат без нужды."""
        existing_path = await run_in_threadpool(
            _sync_existing_original,
            existing,
            self.storage,
            self.image_repository,
            lambda: _restore_original_from_path(
                existing, source_path, suffix, self.storage
            ),
        )
        _update_original_name(existing, original_image_name, self.image_repository)

        root = self.storage.storage_root_for_path(existing_path)
        preview = await run_in_threadpool(
            self.storage.get_preview,
            self.storage.preview_path(existing.image_id, root),
        )
        if preview is None:
            _, loaded_preview = await run_in_threadpool(
                self.loader.load_image_from_path, existing_path
            )
            preview = loaded_preview
            await run_in_threadpool(
                self.storage.save_preview, existing.image_id, preview, root
            )

        logger.info("Image already exists: image_id=%s", existing.image_id)
        return upload_response(existing.image_id, preview)
