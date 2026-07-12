from dataclasses import dataclass
from typing import Optional

import numpy as np


@dataclass
class ImageData:
    filename: str

    original_image: np.ndarray

    image_shape: tuple[int, int] | None = None

    preprocessed_image: Optional[np.ndarray] = None

    segmentation_mask: Optional[np.ndarray] = None

    postprocessed_mask: Optional[np.ndarray] = None