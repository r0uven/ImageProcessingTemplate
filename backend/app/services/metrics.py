import json
import statistics
from pathlib import Path
from typing import Any

from app.api.constants import ANALYSIS_IMAGE_NAMES
from app.database.models import AnalysisResultRecord
from app.storage.image_storage import ImageStorage


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


def _json_object(raw: str | None) -> dict[str, Any] | None:
    """Разбирает JSON-строку в объект; при ошибке возвращает None."""
    if raw is None:
        return None
    try:
        parsed = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        return None
    return parsed if isinstance(parsed, dict) else None


def _legacy_settings_used(
    record: AnalysisResultRecord,
) -> dict[str, Any] | None:
    """Параметры старых запусков: request-часть есть, глобальных секций нет."""
    request: dict[str, Any] = {}

    for key, raw in (
        ("preprocessing", record.preprocessing_params),
        ("segmentation", record.segmentation_params),
        ("separation", record.separation_params),
    ):
        parsed = _json_object(raw)
        if parsed is not None:
            request[key] = parsed

    if not request:
        return None

    return {
        "version": 0,
        "request": request,
        "global": None,
        "complete": False,
    }


def parse_settings_used(
    record: AnalysisResultRecord,
) -> dict[str, Any] | None:
    """Снимок настроек запуска; для старых записей — частичное восстановление."""
    snapshot = _json_object(record.settings_snapshot)

    if snapshot is not None:
        return {
            "version": snapshot.get("version", 0),
            "request": snapshot.get("request") or {},
            "global": snapshot.get("global") or {},
            "complete": True,
        }

    return _legacy_settings_used(record)


def _original_image(
    record: AnalysisResultRecord,
    storage: ImageStorage | None,
) -> dict[str, str] | None:
    """Ссылка на превью оригинала: оно пригодно для показа, в отличие от сырых данных."""
    if storage is None:
        return None

    try:
        original_path = storage.resolve_path(record.file_path)
    except ValueError:
        return None

    if not original_path.is_file():
        return None

    return {
        "type": "original",
        "url": f"/images/{record.image_id}/preview",
    }


def available_analysis_images(
    record: AnalysisResultRecord,
    storage: ImageStorage | None,
) -> list[dict[str, str]]:
    """Ссылки на оригинал и реально сохранённые изображения конкретного запуска."""
    if storage is None:
        return []

    images: list[dict[str, str]] = []
    original = _original_image(record, storage)
    if original is not None:
        images.append(original)

    for name in ANALYSIS_IMAGE_NAMES:
        try:
            path = storage.find_analysis_image_path(record.run_id, name)
        except ValueError:
            continue

        if path is not None:
            images.append(
                {
                    "type": name,
                    "url": f"/analysis/{record.run_id}/images/{name}",
                }
            )

    return images


def build_metrics(
    record: AnalysisResultRecord,
    storage: ImageStorage | None = None,
) -> dict:
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
        "settingsUsed": parse_settings_used(record),
        "images": available_analysis_images(record, storage),
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
