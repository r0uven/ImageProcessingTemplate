import cv2
import numpy as np

from app.config.config_loader import APP_SETTINGS
from app.entities.processing_parameters import (
    PreprocessingParameters,
    default_preprocessing_parameters,
)


class Preprocessor:
    def preprocess(
        self,
        image: np.ndarray,
        parameters: PreprocessingParameters | None = None,
    ) -> np.ndarray:
        settings = parameters or default_preprocessing_parameters()
        original_shape = image.shape

        processed_image = image.copy()

        if settings.normalize:
            low, high = APP_SETTINGS["image"]["pixel_value_range"]
            processed_image_copy = np.zeros_like(processed_image, dtype=np.uint8)
            cv2.normalize(
                processed_image,
                processed_image_copy,
                float(low),
                float(high),
                cv2.NORM_MINMAX,
            )
            processed_image = processed_image_copy

        if settings.denoise:
            processed_image = cv2.fastNlMeansDenoising(processed_image)

        if settings.contrast_enhancement:
            processed_image = self._enhance_contrast(processed_image)

        if settings.smoothing:
            # GaussianBlur ожидает нечётный размер ядра.
            filter_size = max(1, int(settings.filter_size))
            if filter_size % 2 == 0:
                filter_size += 1

            processed_image = cv2.GaussianBlur(
                processed_image, (filter_size, filter_size), 0
            )

        processed_image = processed_image.astype(np.uint8)

        if settings.preserve_size and processed_image.shape != original_shape:
            processed_image = cv2.resize(
                processed_image,
                (original_shape[1], original_shape[0]),
                interpolation=cv2.INTER_NEAREST,
            )

        return processed_image

    @staticmethod
    def _enhance_contrast(image: np.ndarray) -> np.ndarray:
        """Повышает контраст через CLAHE по каналу яркости LAB."""
        if image.ndim != 3:
            return cv2.equalizeHist(image.astype(np.uint8))

        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        lightness, channel_a, channel_b = cv2.split(lab)

        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        lightness = clahe.apply(lightness)

        return cv2.cvtColor(
            cv2.merge((lightness, channel_a, channel_b)),
            cv2.COLOR_LAB2BGR,
        )
