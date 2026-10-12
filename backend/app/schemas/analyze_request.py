from typing import Any

from pydantic import BaseModel


class PreprocessingRequest(BaseModel):
    denoise: bool
    normalize: bool
    contrastEnhancement: bool
    smoothing: bool
    filterSize: int
    preserveSize: bool


class PostprocessingRequest(BaseModel):
    removeSmallObjects: bool
    minObjectArea: int
    fillHoles: bool
    morphologyEnabled: bool
    morphologyOperation: str
    kernelSize: int


class ObjectDetectionRequest(BaseModel):
    connectivity: int
    minObjectArea: int


class QualityMetricsRequest(BaseModel):
    coveredArea: bool
    lostArea: bool
    extraArea: bool
    coverageRatio: bool
    extraRatio: bool


class PoreSeparationRequest(BaseModel):
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
    foregroundValue: int
    backgroundValue: int
    preserveSize: bool


class ThresholdSegmentationRequest(BaseModel):
    thresholdValue: int
    invert: bool


class NeuralSegmentationRequest(BaseModel):
    modelType: str | None
    entities: dict[str, Any]
    defaultConfidenceThreshold: float
    device: str


class SegmentationRequest(BaseModel):
    method: str
    outputMask: OutputMaskParametersRequest
    threshold: ThresholdSegmentationRequest
    neural: NeuralSegmentationRequest


class AnalyzeRequest(BaseModel):
    parametersId: str
    modelId: str
    preprocessing: PreprocessingRequest
    segmentation: SegmentationRequest
    separation: PoreSeparationRequest
