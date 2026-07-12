import cv2
import numpy as np

from app.config.config_loader import APP_SETTINGS


class Preprocessor:

    def preprocess(
            self,
            image: np.ndarray
    ) -> np.ndarray:

        settings = APP_SETTINGS["preprocessing"]

        processed_image = image.copy()

        if settings["normalize"]:
            processed_image_copy = np.zeros_like(processed_image, dtype=np.uint8)
            cv2.normalize(processed_image, processed_image_copy, 0.0, 255.0, cv2.NORM_MINMAX)
            processed_image = processed_image_copy

        if settings["denoise"]:
            processed_image = cv2.fastNlMeansDenoising(
                processed_image
            )

        if settings["smoothing"]:
            filter_size = settings["filter_size"]

            processed_image = cv2.GaussianBlur(
                processed_image,
                (filter_size, filter_size),
                0
            )

        processed_image = processed_image.astype(
            np.uint8
        )

        return processed_image
