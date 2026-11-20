from dataclasses import dataclass

import numpy as np


@dataclass
class ImageData:
    original_image: np.ndarray

    preprocessed_image: np.ndarray | None = None

    segmentation_mask: np.ndarray | None = None

    postprocessed_mask: np.ndarray | None = None
