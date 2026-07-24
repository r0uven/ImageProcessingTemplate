# ORM модели
from dataclasses import dataclass


class ImageModel:
    image_id: str
    file_path: str
    width: int
    height: int
    scale_value: float


class AnalysisRunModel:
    run_id: str
    image_id: str
    model_id: str
    params_id: str
    created_at: int


@dataclass
class Tool:
    id: str
    name: str
    material: str
    architecture: str
    image: str
    removable: bool
    created_at: int
