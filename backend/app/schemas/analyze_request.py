from pydantic import BaseModel


class PreprocessingRequest(BaseModel):
    denoise: bool
    normalize: bool
    contrastEnhancement: bool
    smoothing: bool
    filterSize: int


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


class PoreSeparationRequest(BaseModel):
    enabled: bool
    validateResult: bool
    keepUnseparated: bool


class AnalyzeRequest(BaseModel):
    preprocessing: PreprocessingRequest
    postprocessing: PostprocessingRequest
    objectDetection: ObjectDetectionRequest
    poreSeparation: PoreSeparationRequest