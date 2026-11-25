"""Модели данных, которыми обмениваются приложение и слой БД."""

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
    original_image_name: str | None = None


@dataclass
class AnalysisRunModel:
    run_id: str
    image_id: str
    model_id: str
    params_id: str
    created_at: int
    analysis_result_id: str = ""
    settings_snapshot: str | None = None
    duration: float = 0.0
    status: str = "SUCCESS"


@dataclass(frozen=True)
class AnalysisResultRecord:
    run_id: str
    image_id: str
    model_id: str
    params_id: str
    created_at: int
    analysis_result_id: str
    pore_count: int
    porosity: float
    area: float
    diameter: float
    size_distribution: str | None
    file_path: str
    width: int
    height: int
    # Снимок настроек на момент запуска (JSON) и параметры запроса из
    # processing_parameters — нужны для старых запусков без снимка.
    settings_snapshot: str | None = None
    preprocessing_params: str | None = None
    segmentation_params: str | None = None
    separation_params: str | None = None


@dataclass(frozen=True)
class HistoryRunRecord:
    run_id: str
    image_id: str
    model_id: str
    created_at: int
    file_path: str
    width: int
    height: int
    pore_count: int
    original_image_name: str | None
    duration: float = 0.0
    status: str = "SUCCESS"


@dataclass
class SegmentationModel:
    model_id: str
    model_name: str
    model_type: Literal[
        "neural_network",
        "classical",
        "threshold",
    ]
    model_path: str | None
    material: str
    image: str
    removable: bool
    created_at: int
