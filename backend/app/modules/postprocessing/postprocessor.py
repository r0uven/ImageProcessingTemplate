import cv2
import numpy as np
from scipy import ndimage
from skimage.morphology import remove_small_objects

from app.config.config_loader import APP_SETTINGS

_MORPHOLOGY_OPERATIONS = {
    "closing": cv2.MORPH_CLOSE,
    "opening": cv2.MORPH_OPEN,
    "erosion": cv2.MORPH_ERODE,
    "dilation": cv2.MORPH_DILATE,
    "gradient": cv2.MORPH_GRADIENT,
    "tophat": cv2.MORPH_TOPHAT,
    "blackhat": cv2.MORPH_BLACKHAT,
}


class Postprocessor:
    def postprocess(self, mask: np.ndarray) -> np.ndarray:
        settings = APP_SETTINGS["postprocessing"]
        original_shape = mask.shape

        processed_mask = mask.astype(bool, copy=True)

        # Поры в маске — это False (фон). Все операции выполняем над
        # инвертированной маской, где поры становятся True.
        pores = ~processed_mask

        if settings["remove_small_objects"]:
            min_object_area = int(settings["min_object_area"])

            # ``max_size`` is the replacement for deprecated ``min_size``.
            # Subtract one to preserve the old strict "smaller than" behavior.
            try:
                pores = remove_small_objects(
                    pores, max_size=max(min_object_area - 1, 0)
                )
            except TypeError:
                # Compatibility with scikit-image versions before max_size.
                pores = remove_small_objects(pores, min_size=min_object_area)

        if settings["fill_holes"]:
            pores = ndimage.binary_fill_holes(pores)

        morphology = settings["morphology"]
        if morphology["enabled"]:
            operation = _MORPHOLOGY_OPERATIONS.get(morphology["operation"])
            if operation is not None:
                kernel_size = max(1, int(morphology["kernel_size"]))
                kernel = np.ones((kernel_size, kernel_size), dtype=np.uint8)
                pores = cv2.morphologyEx(
                    pores.astype(np.uint8),
                    operation,
                    kernel,
                ).astype(bool)

        processed_mask = ~pores

        if settings["preserve_size"] and processed_mask.shape != original_shape:
            processed_mask = cv2.resize(
                processed_mask.astype(np.uint8),
                (original_shape[1], original_shape[0]),
                interpolation=cv2.INTER_NEAREST,
            ).astype(bool)

        return processed_mask
