"""Эндпоинты получения информации об изображениях и их превью."""

from fastapi import APIRouter, HTTPException

from app.api.dependencies import ImageRepositoryDep, StorageDep
from app.services.image_conversion import png_response, to_pil
from app.utils.pretty_image import make_pretty_image_plot

router = APIRouter(prefix="/images")


@router.get("")
def list_images(image_repository: ImageRepositoryDep):
    """Список всех загруженных изображений из базы."""
    return image_repository.get_all()


@router.get("/{image_id}")
def get_image_info(image_id: str, image_repository: ImageRepositoryDep):
    """Метаданные одного изображения."""
    record = image_repository.get_by_id(image_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return record


@router.get("/{image_id}/preview")
def get_preview(
    image_id: str,
    storage: StorageDep,
    image_repository: ImageRepositoryDep,
):
    """Отдаёт превью PNG. Если превью нет на диске, генерирует его из оригинала."""
    record = image_repository.get_by_id(image_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Image not found")

    root = storage.storage_root_for_path(record.file_path)
    # Превью ищем рядом с файлом в том хранилище, где он лежит; для старых
    # записей без явного корня — общим поиском по всем хранилищам.
    preview_path = (
        storage.preview_path(image_id, root)
        if root is not None
        else storage.find_preview_path(image_id)
    )
    preview = storage.get_preview(preview_path) if preview_path else None

    if preview is None:
        # Превью генерируется лениво и кэшируется на диске.
        try:
            original = storage.get_original(record.file_path)
        except ValueError as exc:
            raise HTTPException(
                status_code=404,
                detail="Image file is outside registered storages",
            ) from exc

        if original is None:
            raise HTTPException(status_code=404, detail="Image file not found")

        preview = make_pretty_image_plot(to_pil(original))
        storage.save_preview(image_id, preview, root)

    return png_response(preview)
