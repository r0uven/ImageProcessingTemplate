from dataclasses import dataclass, field
from typing import Any

from app.entities.pore_object import PoreObject


@dataclass
class AnalysisResult:
    objects: list[PoreObject] = field(default_factory=list)

    summary_statistics: dict[str, Any] = field(default_factory=dict)

    processing_steps: dict[str, Any] = field(default_factory=dict)

    detected_objects_count: int = 0
