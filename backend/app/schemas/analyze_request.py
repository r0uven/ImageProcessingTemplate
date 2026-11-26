"""Pydantic-схемы запроса на анализ изображения.

Поля намеренно названы в camelCase: так их ожидает frontend. Внутри
приложения они преобразуются в snake_case-сущности маппером.
"""

from typing import Any

from pydantic import BaseModel


class PreprocessingRequest(BaseModel):
    """Настройки предобработки изображения."""

    denoise: bool
    normalize: bool
    contrastEnhancement: bool
    smoothing: bool
    filterSize: int
    preserveSize: bool


class QualityMetricsRequest(BaseModel):
    """Выбор метрик качества разделения пор."""

    coveredArea: bool
    lostArea: bool
    extraArea: bool
    coverageRatio: bool
    extraRatio: bool


class PoreSeparationRequest(BaseModel):
    """Параметры разделения слипшихся пор."""

    enabled: bool
    applyOnlyToCandidates: bool
    preserveAutonomousPores: bool
    keepUnseparatedCandidates: bool
    validateSeparationResult: bool
    preserveParentLink: bool
    evaluateSeparationQuality: bool
    qualityMetrics: QualityMetricsRequest
    algorithmParams: dict[str, Any]


class OutputMaskParametersRequest(BaseModel):
    """Значения пикселей и размер выходной маски."""

    foregroundValue: int
    backgroundValue: int
    preserveSize: bool


class ThresholdSegmentationRequest(BaseModel):
    """Параметры пороговой сегментации."""

    thresholdValue: int
    invert: bool


class NeuralSegmentationRequest(BaseModel):
    """Параметры нейросетевой сегментации."""

    modelType: str | None
    entities: dict[str, Any]
    defaultConfidenceThreshold: float
    device: str


class SegmentationRequest(BaseModel):
    """Параметры сегментации: выбранный метод и настройки обоих методов."""

    method: str
    outputMask: OutputMaskParametersRequest
    threshold: ThresholdSegmentationRequest
    neural: NeuralSegmentationRequest


class AnalyzeRequest(BaseModel):
    """Тело запроса ``POST /analysis/{image_id}``."""

    parametersId: str
    modelId: str
    preprocessing: PreprocessingRequest
    segmentation: SegmentationRequest
    separation: PoreSeparationRequest
