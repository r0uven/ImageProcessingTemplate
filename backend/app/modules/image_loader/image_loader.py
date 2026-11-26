"""Загрузка изображений из байтов или с диска с применением настроек."""

from pathlib import Path

import cv2
import numpy as np
from PIL import Image

from app.config.config_loader import APP_SETTINGS
from app.utils.image_processing import apply_image_settings
from app.utils.pretty_image import make_pretty_image_plot


class ImageLoader:
    """Декодирует изображение и готовит его превью для интерфейса."""

    def load_image(
        self, file_bytes: bytes, filename: str
    ) -> tuple[np.ndarray, Image.Image]:
        """Загружает изображение из переданных байтов."""
        self._validate_suffix(filename)

        image_array = np.frombuffer(file_bytes, np.uint8)
        return self._decode(image_array)

    def load_image_from_path(
        self, file_path: str | Path
    ) -> tuple[np.ndarray, Image.Image]:
        """Загружает изображение напрямую с диска, не передавая байты через API."""
        path = Path(file_path)
        self._validate_suffix(path)

        try:
            # np.fromfile корректно работает с не-ASCII путями на Windows.
            image_array = np.fromfile(str(path), dtype=np.uint8)
        except OSError as exc:
            raise ValueError(f"Failed to read image: {path}") from exc

        return self._decode(image_array)

    @staticmethod
    def _validate_suffix(filename: str | Path) -> None:
        """Проверяет расширение файла по списку разрешённых форматов."""
        file_extension = Path(filename).suffix.lower().lstrip(".")
        if file_extension not in APP_SETTINGS["image"]["allowed_formats"]:
            raise ValueError(f"Unsupported file format: {file_extension}")

    @staticmethod
    def _decode(image_array: np.ndarray) -> tuple[np.ndarray, Image.Image]:
        """Декодирует байты в BGR-массив и строит PNG-превью."""
        original_image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if original_image is None:
            raise ValueError("Failed to decode image")

        original_image = apply_image_settings(original_image)

        # convert BGR → RGB for PIL
        rgb_image = cv2.cvtColor(original_image, cv2.COLOR_BGR2RGB)

        pretty_image = make_pretty_image_plot(rgb_image)

        return original_image, pretty_image
