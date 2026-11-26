"""Пороговая сегментация изображения средствами OpenCV."""

import cv2
import numpy as np

from app.entities.processing_parameters import (
    ThresholdSegmentationParameters,
    default_segmentation_parameters,
)


class ThresholdSegmenter:
    """Строит бинарную маску по заданному порогу яркости."""

    def segment(
        self,
        image: np.ndarray,
        parameters: ThresholdSegmentationParameters | None = None,
    ) -> np.ndarray:
        """Возвращает булеву маску: True — пиксели, прошедшие порог."""
        settings = parameters or default_segmentation_parameters().threshold
        threshold_value = settings.threshold_value
        invert = settings.invert

        # THRESH_BINARY_INV инвертирует результат, если включён ``invert``.
        threshold_type = cv2.THRESH_BINARY_INV if invert else cv2.THRESH_BINARY

        # Порог считается по яркости, поэтому сначала переводим BGR в grayscale.
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        _, mask = cv2.threshold(gray, threshold_value, 255, threshold_type)

        # cv2.threshold возвращает uint8 (0/255) — приводим к bool.
        bool_mask = mask > 0

        return bool_mask
