from fastapi import APIRouter, HTTPException

from app.api.dependencies import ImageRepositoryDep, StorageDep
from app.services.image_conversion import png_response, to_pil
from app.utils.pretty_image import make_pretty_image_plot

router = APIRouter(prefix="/images")


@router.get("")
def list_images(image_repository: ImageRepositoryDep):
    return image_repository.get_all()


@router.get("/{image_id}")
def get_image_info(image_id: str, image_repository: ImageRepositoryDep):
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

    preview = storage.get_preview(storage.preview_path(image_id))

    if preview is None:
        original = storage.get_original(record.file_path)
        if original is None:
            raise HTTPException(status_code=404, detail="Image file not found")

        preview = make_pretty_image_plot(to_pil(original))
        storage.save_preview(image_id, preview)

    return png_response(preview)
