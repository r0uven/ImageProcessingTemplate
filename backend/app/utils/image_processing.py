"""Общие операции приведения загруженного изображения к настройкам приложения."""

import cv2
import numpy as np

from app.config.config_loader import APP_SETTINGS


def apply_image_settings(image: np.ndarray) -> np.ndarray:
    """Применяет image.* настройки к изображению в формате OpenCV (BGR).

    - ``resize_on_load`` приводит изображение к ``default_size``;
    - ``grayscale`` оставляет три канала (пайплайн ожидает BGR), но убирает
      цветовую информацию.
    """
    settings = APP_SETTINGS["image"]

    processed = image

    if settings["resize_on_load"]:
        target_width, target_height = settings["default_size"]
        processed = cv2.resize(processed, (target_width, target_height))

    if settings["grayscale"] and processed.ndim == 3:
        gray = cv2.cvtColor(processed, cv2.COLOR_BGR2GRAY)
        processed = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

    return processed
