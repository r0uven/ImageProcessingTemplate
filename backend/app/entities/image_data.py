"""Контейнер изображения и промежуточных результатов его обработки."""

from dataclasses import dataclass

import numpy as np


@dataclass
class ImageData:
    """Изображение на разных стадиях пайплайна.

    Поля заполняются последовательно: исходное изображение приходит из
    хранилища, остальные появляются по мере выполнения шагов обработки.
    """

    original_image: np.ndarray

    preprocessed_image: np.ndarray | None = None

    segmentation_mask: np.ndarray | None = None

    postprocessed_mask: np.ndarray | None = None
