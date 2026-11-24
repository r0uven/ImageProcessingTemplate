from dataclasses import dataclass

import numpy as np


@dataclass
class PoreObject:
    object_id: int

    area: float
    perimeter: float

    centroid: tuple[float, float] | None

    equivalent_diameter: float

    bounding_box: tuple[int, int, int, int] | None

    roundness: float | None

    # Локальная маска объекта (в границах bounding box), заполняется только
    # если в object_detection.return_object_mask включено.
    object_mask: np.ndarray | None = None
