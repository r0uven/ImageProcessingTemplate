from dataclasses import dataclass, field
from typing import Any


@dataclass
class AnalysisResult:
    analysis_result_id: str = ""
    run_id: str = ""

    pore_count: int = 0
    porosity: float = 0.0
    area: float = 0.0
    diameter: float = 0.0

    size_distribution: dict[str, Any] = field(default_factory=dict)
