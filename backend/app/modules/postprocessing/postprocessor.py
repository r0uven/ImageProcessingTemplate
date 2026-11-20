import numpy as np
from skimage.morphology import remove_small_objects

from app.config.config_loader import APP_SETTINGS


class Postprocessor:
    def postprocess(self, mask: np.ndarray) -> np.ndarray:

        settings = APP_SETTINGS["postprocessing"]

        processed_mask = mask.copy()

        if settings["remove_small_objects"]:
            min_object_area = settings["min_object_area"]

            # Инвертируем:
            # поры становятся True
            inverted_mask = ~processed_mask

            # Удаляем маленькие поры
            # ``max_size`` is the replacement for deprecated ``min_size``.
            # Subtract one to preserve the old strict "smaller than" behavior.
            try:
                cleaned_mask = remove_small_objects(
                    inverted_mask, max_size=max(min_object_area - 1, 0)
                )
            except TypeError:
                # Compatibility with scikit-image versions before max_size.
                cleaned_mask = remove_small_objects(
                    inverted_mask, min_size=min_object_area
                )

            # Возвращаем обратно
            processed_mask = ~cleaned_mask

        return processed_mask
