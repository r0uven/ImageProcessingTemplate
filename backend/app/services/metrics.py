import csv
import io
import json
import math
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


def _number(value: Any) -> float | None:
    """Возвращает число из JSON-значения или None, если значение не число."""
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    return None


def _units(distribution: dict[str, Any]) -> dict[str, str]:
    """Единицы измерения для метрик; старые запуски хранили пиксели."""
    length = distribution.get("length_unit")
    area = distribution.get("area_unit")
    coordinates = distribution.get("coordinates_unit")

    length_unit = length if isinstance(length, str) and length else "px"
    area_unit = area if isinstance(area, str) and area else (
        "мм²" if length_unit == "мм" else "px²"
    )
    coordinates_unit = (
        coordinates if isinstance(coordinates, str) and coordinates else "px"
    )

    return {
        "length": length_unit,
        "area": area_unit,
        "coordinates": coordinates_unit,
    }


def _pore_table(
    distribution: dict[str, Any],
) -> list[dict[str, Any]]:
    """Строит таблицу пор из сохранённого распределения.

    Новые запуски содержат подробный список ``pores``; для старых запусков
    таблица восстанавливается из массивов площадей и диаметров без координат.
    """
    raw_pores = distribution.get("pores")
    rows: list[dict[str, Any]] = []

    if isinstance(raw_pores, list):
        for item in raw_pores:
            if not isinstance(item, dict):
                continue

            area = _number(item.get("area"))
            radius = _number(item.get("equivalent_radius"))
            diameter = _number(item.get("equivalent_diameter"))

            if radius is None and diameter is not None:
                radius = diameter / 2
            if radius is None and area is not None and area > 0:
                radius = math.sqrt(area / math.pi)
            if area is None and radius is not None:
                area = math.pi * radius**2

            if area is None or radius is None:
                continue

            index = len(rows) + 1
            object_id = item.get("object_id")
            rows.append(
                {
                    "index": index,
                    "objectId": (
                        int(object_id)
                        if isinstance(object_id, (int, float))
                        and not isinstance(object_id, bool)
                        else index
                    ),
                    "area": float(area),
                    "equivalentRadius": float(radius),
                    "centerX": _number(item.get("center_x")),
                    "centerY": _number(item.get("center_y")),
                }
            )

    if rows:
        return rows

    areas = _numbers(distribution.get("areas"))
    diameters = _numbers(distribution.get("diameters"))
    count = max(len(areas), len(diameters))

    for index in range(count):
        area = areas[index] if index < len(areas) else None
        radius = diameters[index] / 2 if index < len(diameters) else None

        if radius is None and area is not None and area > 0:
            radius = math.sqrt(area / math.pi)
        if area is None and radius is not None:
            area = math.pi * radius**2
        if area is None or radius is None:
            continue

        rows.append(
            {
                "index": index + 1,
                "objectId": index + 1,
                "area": float(area),
                "equivalentRadius": float(radius),
                "centerX": None,
                "centerY": None,
            }
        )

    return rows


def _summary(
    distribution: dict[str, Any],
    record: AnalysisResultRecord,
    pores: list[dict[str, Any]],
) -> dict[str, float | int]:
    """Базовый набор метрик, который показывается на странице результатов."""
    areas = [float(pore["area"]) for pore in pores]
    radii = [float(pore["equivalentRadius"]) for pore in pores]

    if not areas:
        areas = _numbers(distribution.get("areas"))
    if not radii:
        radii = [diameter / 2 for diameter in _numbers(distribution.get("diameters"))]

    # Очень старые запуски могли не сохранить распределение: используем
    # агрегаты из БД, чтобы страница результатов не осталась пустой.
    if not areas and record.pore_count > 0 and record.area > 1e-9:
        areas = [float(record.area)] * int(record.pore_count)
    if not radii and record.pore_count > 0 and record.diameter > 1e-9:
        radii = [float(record.diameter) / 2] * int(record.pore_count)

    total_area = _number(distribution.get("total_area"))
    if total_area is None:
        total_area = sum(areas)

    porosity = _number(distribution.get("porosity"))
    if porosity is None:
        porosity = float(record.porosity)

    mean_area = sum(areas) / len(areas) if areas else 0.0
    mean_radius = sum(radii) / len(radii) if radii else 0.0

    return {
        "poreCount": int(record.pore_count),
        "totalPoreArea": float(total_area),
        "porosityPercent": float(porosity) * 100,
        "meanPoreArea": float(mean_area),
        "meanEquivalentRadius": float(mean_radius),
        "minEquivalentRadius": float(min(radii)) if radii else 0.0,
        "maxEquivalentRadius": float(max(radii)) if radii else 0.0,
    }


def _csv_number(value: float | None) -> str:
    if value is None:
        return ""
    if isinstance(value, int):
        return str(value)
    return f"{value:.6g}"


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
    pores = _pore_table(distribution)

    return {
        "filename": (
            Path(record.file_path).name if record.file_path else record.image_id
        ),
        "detectedObjects": record.pore_count,
        "settingsUsed": parse_settings_used(record),
        "images": available_analysis_images(record, storage),
        "summary": _summary(distribution, record, pores),
        "pores": pores,
        "units": _units(distribution),
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


def build_pores_csv(
    record: AnalysisResultRecord,
    storage: ImageStorage | None = None,
) -> str:
    """Формирует CSV с базовыми метриками и таблицей пор."""
    metrics = build_metrics(record, storage)
    summary = metrics["summary"]
    units = metrics["units"]
    pores = metrics["pores"]

    buffer = io.StringIO(newline="")
    writer = csv.writer(buffer, delimiter=",", lineterminator="\r\n")

    writer.writerow(["Показатель", "Значение", "Единица"])
    writer.writerow(["Файл", metrics["filename"], ""])
    writer.writerow(["Количество найденных пор", summary["poreCount"], "шт."])
    writer.writerow(
        ["Суммарная площадь пор", _csv_number(summary["totalPoreArea"]), units["area"]]
    )
    writer.writerow(
        ["Пористость", _csv_number(summary["porosityPercent"]), "%"]
    )
    writer.writerow(
        ["Средняя площадь поры", _csv_number(summary["meanPoreArea"]), units["area"]]
    )
    writer.writerow(
        [
            "Средний эквивалентный радиус",
            _csv_number(summary["meanEquivalentRadius"]),
            units["length"],
        ]
    )
    writer.writerow(
        [
            "Минимальный эквивалентный радиус",
            _csv_number(summary["minEquivalentRadius"]),
            units["length"],
        ]
    )
    writer.writerow(
        [
            "Максимальный эквивалентный радиус",
            _csv_number(summary["maxEquivalentRadius"]),
            units["length"],
        ]
    )

    writer.writerow([])

    has_coordinates = any(
        pore["centerX"] is not None or pore["centerY"] is not None
        for pore in pores
    )
    header = [
        "№",
        f"Площадь, {units['area']}",
        f"Эквивалентный радиус, {units['length']}",
    ]
    if has_coordinates:
        header.extend(
            [
                f"X, {units['coordinates']}",
                f"Y, {units['coordinates']}",
            ]
        )
    writer.writerow(header)

    for pore in pores:
        row = [
            pore["index"],
            _csv_number(pore["area"]),
            _csv_number(pore["equivalentRadius"]),
        ]
        if has_coordinates:
            row.extend(
                [
                    _csv_number(pore["centerX"]),
                    _csv_number(pore["centerY"]),
                ]
            )
        writer.writerow(row)

    # BOM помогает Excel корректно открыть кириллицу.
    return "\ufeff" + buffer.getvalue()
