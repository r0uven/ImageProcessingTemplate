import cv2
import numpy as np

from app.entities.processing_parameters import (
    ThresholdSegmentationParameters,
    default_segmentation_parameters,
)


class ThresholdSegmenter:
    def segment(
        self,
        image: np.ndarray,
        parameters: ThresholdSegmentationParameters | None = None,
    ) -> np.ndarray:
        settings = parameters or default_segmentation_parameters().threshold
        threshold_value = settings.threshold_value
        invert = settings.invert

        threshold_type = cv2.THRESH_BINARY_INV if invert else cv2.THRESH_BINARY

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        _, mask = cv2.threshold(gray, threshold_value, 255, threshold_type)

        # bool mask
        bool_mask = mask > 0

        return bool_mask
