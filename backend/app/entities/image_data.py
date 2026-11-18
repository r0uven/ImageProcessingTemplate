from dataclasses import dataclass

import numpy as np


@dataclass
class ImageData:
    filename: str

    original_image: np.ndarray

    image_shape: tuple[int, int] | None = None

    preprocessed_image: np.ndarray | None = None

    segmentation_mask: np.ndarray | None = None

    postprocessed_mask: np.ndarray | None = None
