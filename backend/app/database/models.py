# ORM модели
from dataclasses import dataclass
from typing import Literal


@dataclass
class ImageModel:
    image_id: str
    file_path: str
    width: int
    height: int
    scale_value: float
    content_hash: str | None = None


@dataclass
class AnalysisRunModel:
    run_id: str
    image_id: str
    model_id: str
    params_id: str
    created_at: int
    analysis_result_id: str = ""


@dataclass
class SegmentationModel:
    model_id: str
    model_name: str
    model_type: Literal[
        "neural_network",
        "classical",
        "threshold",
    ]
    model_path: str
    material: str
    image: str
    removable: bool
    created_at: int
