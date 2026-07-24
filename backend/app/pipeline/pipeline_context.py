from dataclasses import dataclass, field

from app.entities.analysis_result import AnalysisResult
from app.entities.image_data import ImageData


@dataclass
class PipelineContext:
    image_data: ImageData | None = None

    analysis_result: AnalysisResult = field(default_factory=AnalysisResult)
