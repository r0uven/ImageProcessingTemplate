from pathlib import Path

import cv2
import numpy as np

from app.config.config_loader import APP_SETTINGS
from app.utils.pretty_image import make_pretty_image_plot


class ImageLoader:
    def load_image(self, file_bytes: bytes, filename: str):
        image_settings = APP_SETTINGS["image"]

        file_extension = Path(filename).suffix.lower().lstrip(".")

        if file_extension not in image_settings["allowed_formats"]:
            raise ValueError(f"Unsupported file format: {file_extension}")

        image_array = np.frombuffer(file_bytes, np.uint8)

        return self._decode(image_array)

    def load_image_from_path(self, file_path: str | Path):
        """Загружает изображение напрямую с диска, не передавая байты через API."""
        image_settings = APP_SETTINGS["image"]

        path = Path(file_path)
        file_extension = path.suffix.lower().lstrip(".")

        if file_extension not in image_settings["allowed_formats"]:
            raise ValueError(f"Unsupported file format: {file_extension}")

        try:
            # np.fromfile корректно работает с не-ASCII путями на Windows.
            image_array = np.fromfile(str(path), dtype=np.uint8)
        except OSError as exc:
            raise ValueError(f"Failed to read image: {path}") from exc

        return self._decode(image_array)

    @staticmethod
    def _decode(image_array: np.ndarray):
        image_settings = APP_SETTINGS["image"]

        original_image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if original_image is None:
            raise ValueError("Failed to decode image")

        if image_settings["resize_on_load"]:
            original_image = cv2.resize(
                original_image, tuple(image_settings["default_size"])
            )

        # convert BGR → RGB for PIL
        rgb_image = cv2.cvtColor(original_image, cv2.COLOR_BGR2RGB)

        pretty_image = make_pretty_image_plot(rgb_image)

        return original_image, pretty_image
