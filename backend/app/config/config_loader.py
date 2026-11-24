import json
from pathlib import Path

CONFIG_PATH = Path(__file__).with_name("settings.json")

# Корень backend-приложения. Относительные пути из settings.json
# (например, storage.images_directory) считаются от него.
BASE_DIR = Path(__file__).resolve().parents[2]

DEFAULT_IMAGES_DIRECTORY = "data/images"


def resolve_backend_path(value: str | Path) -> Path:
    """Преобразует путь из настроек в абсолютный путь внутри backend."""
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = BASE_DIR / path
    return path.resolve()


def resolve_images_directory(value: str | Path | None = None) -> Path:
    """Возвращает абсолютную директорию для всех изображений приложения."""
    if value is None:
        value = APP_SETTINGS.get("storage", {}).get(
            "images_directory", DEFAULT_IMAGES_DIRECTORY
        )
    return resolve_backend_path(value)


with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    APP_SETTINGS = json.load(f)
