"""Итоговые числовые характеристики проанализированного изображения."""

from dataclasses import dataclass, field
from typing import Any


@dataclass
class AnalysisResult:
    """Сводные метрики по порам, полученные на шаге извлечения признаков."""

    analysis_result_id: str = ""

    pore_count: int = 0
    porosity: float = 0.0
    area: float = 0.0
    diameter: float = 0.0

    size_distribution: dict[str, Any] = field(default_factory=dict)
