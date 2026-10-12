from dataclasses import dataclass


@dataclass
class PoreObject:
    object_id: int

    area: float
    perimeter: float

    centroid: tuple[float, float]

    equivalent_diameter: float

    bounding_box: tuple[int, int, int, int] | None

    roundness: float | None

    status: str = "autonomous"

    parent_object_id: int | None = None
