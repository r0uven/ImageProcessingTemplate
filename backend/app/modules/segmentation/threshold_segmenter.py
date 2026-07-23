import cv2
import numpy as np

from app.config.config_loader import APP_SETTINGS

class ThresholdSegmenter:

    def segment(
        self,
        image: np.ndarray
    ) -> np.ndarray:

        settings = APP_SETTINGS["segmentation"]

        threshold_settings = settings["threshold"]

        threshold_value = (
            threshold_settings["threshold_value"]
        )

        invert = threshold_settings["invert"]

        threshold_type = (
            cv2.THRESH_BINARY_INV
            if invert
            else cv2.THRESH_BINARY
        )
        
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        _, mask = cv2.threshold(
            gray,
            threshold_value,
            255,
            threshold_type
        )

        # bool mask
        mask = mask > 0

        return mask