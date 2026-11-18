from dataclasses import dataclass, field
from typing import Any

from app.config.config_loader import APP_SETTINGS


@dataclass
class PreprocessingParameters:
    denoise: bool
    normalize: bool
    contrast_enhancement: bool
    smoothing: bool
    filter_size: int
    preserve_size: bool


@dataclass
class OutputMaskParameters:
    foreground_value: int
    background_value: int
    preserve_size: bool


@dataclass
class ThresholdSegmentationParameters:
    threshold_value: int
    invert: bool


@dataclass
class NeuralSegmentationParameters:
    model_id: str | None
    entities: dict[str, Any]
    default_confidence_threshold: float
    device: str


@dataclass
class SegmentationParameters:
    method: str
    output_mask: OutputMaskParameters
    threshold: ThresholdSegmentationParameters
    neural: NeuralSegmentationParameters


@dataclass
class QualityMetricsParameters:
    covered_area: bool
    lost_area: bool
    extra_area: bool
    coverage_ratio: bool
    extra_ratio: bool


@dataclass
class SeparationParameters:
    enabled: bool
    apply_only_to_candidates: bool
    preserve_autonomous_pores: bool
    keep_unseparated_candidates: bool
    validate_separation_result: bool
    preserve_parent_link: bool
    evaluate_separation_quality: bool
    quality_metrics: QualityMetricsParameters
    algorithm_params: dict[str, Any]


def default_preprocessing_parameters() -> PreprocessingParameters:
    settings = APP_SETTINGS["preprocessing"]

    return PreprocessingParameters(
        denoise=settings["denoise"],
        normalize=settings["normalize"],
        contrast_enhancement=settings["contrast_enhancement"],
        smoothing=settings["smoothing"],
        filter_size=settings["filter_size"],
        preserve_size=settings["preserve_size"],
    )


def default_segmentation_parameters() -> SegmentationParameters:
    settings = APP_SETTINGS["segmentation"]

    return SegmentationParameters(
        method=settings["method"],
        output_mask=OutputMaskParameters(
            foreground_value=settings["output"]["foreground_value"],
            background_value=settings["output"]["background_value"],
            preserve_size=settings["output"]["preserve_size"],
        ),
        threshold=ThresholdSegmentationParameters(
            threshold_value=settings["threshold"]["threshold_value"],
            invert=settings["threshold"]["invert"],
        ),
        neural=NeuralSegmentationParameters(
            model_id=settings["neural"]["selected_model"],
            entities=settings["neural"]["entities"].copy(),
            default_confidence_threshold=settings["neural"][
                "default_confidence_threshold"
            ],
            device=settings["neural"]["device"],
        ),
    )


def default_separation_parameters() -> SeparationParameters:
    settings = APP_SETTINGS["pore_separation"]

    return SeparationParameters(
        enabled=settings["enabled"],
        apply_only_to_candidates=settings["apply_only_to_candidates"],
        preserve_autonomous_pores=settings["preserve_autonomous_pores"],
        keep_unseparated_candidates=settings["keep_unseparated_candidates"],
        validate_separation_result=settings["validate_separation_result"],
        preserve_parent_link=settings["preserve_parent_link"],
        evaluate_separation_quality=settings["evaluate_separation_quality"],
        quality_metrics=QualityMetricsParameters(
            covered_area=settings["quality_metrics"]["covered_area"],
            lost_area=settings["quality_metrics"]["lost_area"],
            extra_area=settings["quality_metrics"]["extra_area"],
            coverage_ratio=settings["quality_metrics"]["coverage_ratio"],
            extra_ratio=settings["quality_metrics"]["extra_ratio"],
        ),
        algorithm_params=settings["algorithm_params"].copy(),
    )


@dataclass
class ProcessingParameters:
    parameters_id: str = ""

    preprocessing: PreprocessingParameters = field(
        default_factory=default_preprocessing_parameters
    )

    segmentation: SegmentationParameters = field(
        default_factory=default_segmentation_parameters
    )

    separation: SeparationParameters = field(
        default_factory=default_separation_parameters
    )
