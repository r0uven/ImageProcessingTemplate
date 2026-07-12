from dataclasses import (
    dataclass,
    field
)

from typing import Optional

from app.entities.analysis_result import (
    AnalysisResult
)

from app.entities.image_data import (
    ImageData
)


@dataclass
class PipelineContext:

    image_data: Optional[ImageData] = None

    analysis_result: AnalysisResult = field(
        default_factory=AnalysisResult
    )