from dataclasses import dataclass, field
from typing import List, Dict, Any

from app.entities.pore_object import PoreObject


@dataclass
class AnalysisResult:

    objects: List[PoreObject] = field(
        default_factory=list
    )

    summary_statistics: Dict[str, Any] = field(
        default_factory=dict
    )

    processing_steps: Dict[str, Any] = field(
        default_factory=dict
    )

    detected_objects_count: int = 0