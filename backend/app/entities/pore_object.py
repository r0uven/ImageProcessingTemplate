from dataclasses import dataclass
from typing import Optional, Tuple


@dataclass
class PoreObject:
    object_id: int

    area: float
    perimeter: float

    centroid: Tuple[float, float]

    equivalent_diameter: float

    bounding_box: Optional[Tuple[int, int, int, int]]

    roundness: Optional[float]

    status: str = "autonomous"

    parent_object_id: Optional[int] = None