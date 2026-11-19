from pydantic import BaseModel


class UploadPathRequest(BaseModel):
    """Путь к изображению в файловой системе компьютера."""

    path: str
