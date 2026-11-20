from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.api.dependencies import ImageRepositoryDep, LoaderDep, StorageDep
from app.schemas.upload_request import UploadPathRequest
from app.services.image_upload import ImageUploadService

router = APIRouter()


@router.post("/upload")
async def upload_image(
    file: Annotated[UploadFile, File()],
    storage: StorageDep,
    loader: LoaderDep,
    image_repository: ImageRepositoryDep,
) -> dict:
    """Сохраняет изображение. Если такое уже загружено (по хэшу), возвращает существующее."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    service = ImageUploadService(storage, loader, image_repository)
    return await service.upload_bytes(file.filename, await file.read())


@router.post("/upload/path")
async def upload_image_from_path(
    request: UploadPathRequest,
    storage: StorageDep,
    loader: LoaderDep,
    image_repository: ImageRepositoryDep,
) -> dict:
    """Копирует изображение с локального диска во внутреннее хранилище.

    Фронтенд передаёт только путь к файлу, поэтому байты большого изображения
    не проходят через HTTP. Копия делается потоково, без загрузки файла в память.
    """
    service = ImageUploadService(storage, loader, image_repository)
    return await service.upload_path(request.path)
