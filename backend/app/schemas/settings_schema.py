"""Pydantic-схема глобальных настроек приложения.

Настройки по умолчанию заданы в ``app/config/default_settings.py``, рабочая
копия хранится в ``app/config/settings.json``. Схема нужна для валидации
данных, которые приходят из UI перед записью файла.
"""

import re
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class _StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ImageSettings(_StrictModel):
    allowed_formats: list[str] = Field(min_length=1)
    allowed_sizes: list[tuple[int, int]] = Field(default_factory=list)
    default_size: tuple[int, int]
    grayscale: bool
    pixel_value_range: tuple[int, int]
    resize_on_load: bool

    @field_validator("allowed_formats")
    @classmethod
    def _normalize_formats(cls, values: list[str]) -> list[str]:
        normalized: list[str] = []
        for value in values:
            item = value.strip().lower().lstrip(".")
            if not item:
                raise ValueError("Формат изображения не может быть пустым")
            if item not in normalized:
                normalized.append(item)
        if not normalized:
            raise ValueError("Нужен хотя бы один разрешённый формат")
        return normalized

    @field_validator("allowed_sizes")
    @classmethod
    def _positive_sizes(cls, value: list[tuple[int, int]]) -> list[tuple[int, int]]:
        for width, height in value:
            if width <= 0 or height <= 0:
                raise ValueError("Размеры изображения должны быть положительными")
        return value

    @field_validator("default_size")
    @classmethod
    def _positive_default_size(cls, value: tuple[int, int]) -> tuple[int, int]:
        width, height = value
        if width <= 0 or height <= 0:
            raise ValueError("Размеры изображения должны быть положительными")
        return value

    @field_validator("pixel_value_range")
    @classmethod
    def _valid_pixel_range(cls, value: tuple[int, int]) -> tuple[int, int]:
        low, high = value
        if not 0 <= low <= high <= 255:
            raise ValueError("Диапазон значений пикселей должен быть в пределах 0..255")
        return value

    @model_validator(mode="after")
    def _default_size_is_allowed(self) -> "ImageSettings":
        if (
            self.allowed_sizes
            and self.default_size not in self.allowed_sizes
            and self.resize_on_load
        ):
            raise ValueError(
                "default_size должен входить в allowed_sizes, если включён resize_on_load"
            )
        return self


class PreprocessingSettings(_StrictModel):
    denoise: bool
    normalize: bool
    contrast_enhancement: bool
    smoothing: bool
    filter_size: int = Field(ge=1)
    preserve_size: bool


class OutputMaskSettings(_StrictModel):
    foreground_value: int = Field(ge=0, le=255)
    background_value: int = Field(ge=0, le=255)
    preserve_size: bool


class ThresholdSegmentationSettings(_StrictModel):
    threshold_value: int = Field(ge=0, le=255)
    invert: bool


class NeuralSegmentationSettings(_StrictModel):
    selected_model: str | None = None
    entities: dict[str, Any] = Field(default_factory=dict)
    default_confidence_threshold: float = Field(ge=0.0, le=1.0)
    device: str = "cpu"


class SegmentationSettings(_StrictModel):
    method: Literal["threshold", "neural"]
    output: OutputMaskSettings
    threshold: ThresholdSegmentationSettings
    neural: NeuralSegmentationSettings


class MorphologySettings(_StrictModel):
    enabled: bool
    operation: Literal[
        "closing",
        "opening",
        "erosion",
        "dilation",
        "gradient",
        "tophat",
        "blackhat",
    ]
    kernel_size: int = Field(ge=1)


class PostprocessingSettings(_StrictModel):
    remove_small_objects: bool
    min_object_area: int = Field(ge=0)
    fill_holes: bool
    morphology: MorphologySettings
    preserve_size: bool


class ObjectDetectionSettings(_StrictModel):
    connectivity: Literal[4, 8]
    min_object_area: int = Field(ge=0)
    return_bounding_box: bool
    return_centroid: bool
    return_object_mask: bool


class CandidateRulesSettings(_StrictModel):
    max_area: float | None = None
    min_roundness: float | None = None
    max_eccentricity: float | None = None
    min_solidity: float | None = None
    min_extent: float | None = None


class ClassificationFeaturesSettings(_StrictModel):
    use_area: bool
    use_roundness: bool
    use_eccentricity: bool
    use_solidity: bool
    use_extent: bool


class ObjectClassificationSettings(_StrictModel):
    classification_mode: str
    candidate_rules: CandidateRulesSettings
    features: ClassificationFeaturesSettings


class QualityMetricsSettings(_StrictModel):
    covered_area: bool
    lost_area: bool
    extra_area: bool
    coverage_ratio: bool
    extra_ratio: bool


class PoreSeparationSettings(_StrictModel):
    enabled: bool
    apply_only_to_candidates: bool
    preserve_autonomous_pores: bool
    keep_unseparated_candidates: bool
    validate_separation_result: bool
    preserve_parent_link: bool
    evaluate_separation_quality: bool
    quality_metrics: QualityMetricsSettings
    algorithm_params: dict[str, Any] = Field(default_factory=dict)


class PoreMergingSettings(_StrictModel):
    preserve_object_status: bool
    preserve_parent_object_id: bool
    preserve_separation_quality_metrics: bool
    include_autonomous_pores: bool
    include_separated_objects: bool
    include_unseparated_candidates: bool
    object_statuses: list[str]


class RegionObjectFeaturesSettings(_StrictModel):
    area: bool
    perimeter: bool
    centroid: bool
    equivalent_diameter: bool
    bounding_box: bool
    roundness: bool
    relative_area: bool


class CircleObjectFeaturesSettings(_StrictModel):
    center: bool
    radius: bool
    diameter: bool
    area: bool
    circumference: bool
    relative_area: bool


class SummaryStatisticsSettings(_StrictModel):
    total_count: bool
    count_by_status: bool
    total_pore_area: bool
    mean_area: bool
    min_area: bool
    max_area: bool
    porosity: bool
    size_distribution: bool


class FeatureExtractionSettings(_StrictModel):
    calculate_object_features: bool
    calculate_summary_statistics: bool
    preserve_object_status: bool
    preserve_parent_object_id: bool
    include_separation_quality_metrics: bool
    use_status_based_feature_source: bool
    use_scale: bool
    scale_mm_per_pixel: float | None = Field(default=None, gt=0)
    region_object_features: RegionObjectFeaturesSettings
    circle_object_features: CircleObjectFeaturesSettings
    separation_quality_metrics: QualityMetricsSettings
    summary_statistics: SummaryStatisticsSettings

    @model_validator(mode="after")
    def _scale_is_configured(self) -> "FeatureExtractionSettings":
        if self.use_scale and self.scale_mm_per_pixel is None:
            raise ValueError(
                "scale_mm_per_pixel должен быть задан, если включён use_scale"
            )
        return self


class AnalysisPipelineSettings(_StrictModel):
    save_intermediate_results: bool
    save_run_parameters: bool
    save_segmentation_mask: bool
    save_postprocessed_mask: bool
    save_classification_result: bool
    save_separation_result: bool
    save_final_objects: bool
    save_features: bool


class StorageEntry(_StrictModel):
    """Одно зарегистрированное хранилище изображений."""

    id: str = Field(min_length=1, max_length=64)
    path: str = Field(min_length=1)
    label: str = ""
    created_at: str | None = None
    last_used_at: str | None = None

    @field_validator("id")
    @classmethod
    def _safe_id(cls, value: str) -> str:
        value = value.strip()
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", value):
            raise ValueError("Некорректный идентификатор хранилища")
        return value

    @field_validator("path")
    @classmethod
    def _non_empty_path(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Путь к папке хранилища не может быть пустым")
        return value


class StorageSettings(_StrictModel):
    active_storage_id: str = Field(min_length=1)
    storages: list[StorageEntry] = Field(min_length=1)
    cache_max_age_days: int = Field(ge=0)
    cache_max_total_bytes: int = Field(ge=0)
    cleanup_interval_minutes: int = Field(ge=1)
    cleanup_max_deletions_per_run: int = Field(ge=0)

    @model_validator(mode="after")
    def _active_storage_exists(self) -> "StorageSettings":
        ids = [entry.id for entry in self.storages]
        if len(ids) != len(set(ids)):
            raise ValueError("Идентификаторы хранилищ должны быть уникальны")
        if self.active_storage_id not in ids:
            raise ValueError(
                "active_storage_id должен указывать на одно из хранилищ"
            )
        return self


class StorageCreateRequest(_StrictModel):
    path: str = Field(min_length=1)
    label: str = ""
    activate: bool = False

    @field_validator("path")
    @classmethod
    def _non_empty_path(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Путь к папке хранилища не может быть пустым")
        return value


class StorageUpdateRequest(_StrictModel):
    path: str | None = None
    label: str | None = None

    @field_validator("path")
    @classmethod
    def _non_empty_path(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Путь к папке хранилища не может быть пустым")
        return value


class TrainingParamsSettings(_StrictModel):
    epochs: int | None = Field(default=None, ge=1)
    batch_size: int | None = Field(default=None, ge=1)
    learning_rate: float | None = Field(default=None, gt=0)
    architecture: str | None = None


class ModelRegistrySettings(_StrictModel):
    save_model_file: bool
    register_model_in_config: bool
    models_directory: str = Field(min_length=1)


class TrainingMetricsSettings(_StrictModel):
    dice: bool
    iou: bool
    pixel_accuracy: bool


class TrainingSettings(_StrictModel):
    dataset_pair_format: str
    validate_image_mask_size: bool
    allowed_image_formats: list[str] = Field(min_length=1)
    allowed_mask_formats: list[str] = Field(min_length=1)
    training_params: TrainingParamsSettings
    model_registry: ModelRegistrySettings
    metrics: TrainingMetricsSettings

    @field_validator("allowed_image_formats", "allowed_mask_formats")
    @classmethod
    def _normalize_training_formats(cls, values: list[str]) -> list[str]:
        normalized: list[str] = []
        for value in values:
            item = value.strip().lower()
            if not item:
                raise ValueError("Формат файла не может быть пустым")
            if not item.startswith("."):
                item = f".{item}"
            if item not in normalized:
                normalized.append(item)
        if not normalized:
            raise ValueError("Нужен хотя бы один разрешённый формат")
        return normalized


class AppSettings(_StrictModel):
    image: ImageSettings
    preprocessing: PreprocessingSettings
    segmentation: SegmentationSettings
    postprocessing: PostprocessingSettings
    object_detection: ObjectDetectionSettings
    object_classification: ObjectClassificationSettings
    pore_separation: PoreSeparationSettings
    pore_merging: PoreMergingSettings
    feature_extraction: FeatureExtractionSettings
    analysis_pipeline: AnalysisPipelineSettings
    storage: StorageSettings
    training: TrainingSettings
