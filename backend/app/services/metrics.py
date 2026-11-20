import json
import statistics
from pathlib import Path
from typing import Any

from app.database.models import AnalysisResultRecord


def parse_size_distribution(raw: str | None) -> dict[str, Any]:
    if raw is None:
        return {}
    try:
        data = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        return {}
    return data if isinstance(data, dict) else {}


def _numbers(value: Any) -> list[float]:
    """Оставляет в JSON-массиве только числовые значения."""
    if not isinstance(value, list):
        return []
    return [
        float(item)
        for item in value
        if isinstance(item, (int, float)) and not isinstance(item, bool)
    ]


def describe(values: list[float]) -> dict[str, float]:
    """Считает статистику по списку значений; для пустого списка возвращает нули."""
    if not values:
        return {
            "min": 0.0,
            "max": 0.0,
            "mean": 0.0,
            "median": 0.0,
            "standardDeviation": 0.0,
        }

    return {
        "min": float(min(values)),
        "max": float(max(values)),
        "mean": float(sum(values) / len(values)),
        "median": float(statistics.median(values)),
        "standardDeviation": float(statistics.pstdev(values)),
    }


def points(values: list[float]) -> list[dict[str, float]]:
    """Превращает значения в точки для графика распределения."""
    return [{"x": float(value), "y": 1} for value in values]


def build_metrics(record: AnalysisResultRecord) -> dict:
    """Метрики одного запуска: распределения и статистика по порам."""
    distribution = parse_size_distribution(record.size_distribution)
    areas = _numbers(distribution.get("areas"))
    diameters = _numbers(distribution.get("diameters"))

    # Если детального распределения нет, статистику строим по одному
    # агрегированному значению.
    area_values = areas or (
        [record.area] if record.pore_count > 0 and record.area > 0 else []
    )
    diameter_values = diameters or (
        [record.diameter] if record.pore_count > 0 and record.diameter > 0 else []
    )

    zero_stats = describe([])

    return {
        "filename": (
            Path(record.file_path).name if record.file_path else record.image_id
        ),
        "detectedObjects": record.pore_count,
        "distributions": {
            "PORE_SIZE": points(diameters),
            "AREA": points(areas),
            "PERIMETER": [],
            "CIRCULARITY": [],
            "FORM_FACTOR": [],
        },
        "statistics": {
            "PORE_SIZE": describe(diameter_values),
            "AREA": describe(area_values),
            "PERIMETER": zero_stats,
            "CIRCULARITY": zero_stats,
            "FORM_FACTOR": zero_stats,
        },
    }
