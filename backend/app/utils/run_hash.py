"""Утилиты для генерирования детерминированного хеша запуска анализа."""

import hashlib
import json
from collections.abc import Mapping
from dataclasses import asdict
from typing import Any

import numpy as np
from PIL import Image

from app.entities.analysis_result import AnalysisResult
from app.schemas.analyze_request import AnalyzeRequest

# Версия схемы хеширования. Меняется при изменении состава факторов,
# чтобы старые и новые хеши не пересекались.
HASH_VERSION = 1


def _serialize_parameters(parameters: AnalyzeRequest) -> dict[str, Any]:
    """Сериализует параметры обработки для хеширования.

    ``parametersId`` — случайный идентификатор набора параметров, который
    генерируется клиентом. Он не влияет на результат обработки, поэтому
    исключается из хеша: одинаковые параметры должны давать одинаковый хеш.
    """
    from app.mappers.processing_parameters_mapper import to_processing_parameters

    serialized = json.loads(
        json.dumps(
            asdict(to_processing_parameters(parameters)),
            sort_keys=True,
            default=str,
        )
    )
    serialized.pop("parameters_id", None)
    return serialized


def _hash_image(image: np.ndarray | Image.Image) -> str:
    """Вычисляет SHA-256 хеш пиксельных данных изображения.

    В хеш входят тип данных, размер и сами пиксели, поэтому любые изменения
    результирующей картинки меняют итоговый хеш запуска.
    """
    if isinstance(image, Image.Image):
        header = f"PIL:{image.mode}:{image.width}x{image.height}:".encode()
        payload = header + image.tobytes()
    else:
        array = np.ascontiguousarray(image)
        header = f"NDARRAY:{array.dtype.str}:{array.shape}:".encode()
        payload = header + array.tobytes()

    return hashlib.sha256(payload).hexdigest()


def compute_run_hash(
    image_id: str,
    model_id: str,
    parameters: AnalyzeRequest,
    analysis_result: AnalysisResult,
    images: Mapping[str, np.ndarray | Image.Image] | None = None,
) -> str:
    """
    Вычисляет детерминированный SHA-256 хеш для запуска анализа.

    Хеш зависит от всего, что влияет на результат или связано с ним:
    - ID исходного изображения (image_id)
    - ID используемой модели (model_id)
    - Параметров обработки (все параметры из AnalyzeRequest)
    - Результатов анализа (характеристики, найденные объекты)
    - Результирующих изображений (препроцессинг, маска, overlay и т.д.)

    Args:
        image_id: Идентификатор исходного изображения
        model_id: Идентификатор используемой модели
        parameters: Параметры обработки изображения
        analysis_result: Результаты анализа (pore_count, porosity, etc.)
        images: Результирующие изображения запуска (имя -> изображение)

    Returns:
        SHA-256 хеш в hex-формате (64 символа)
    """
    # Собираем все факторы в один объект для хеширования
    hash_factors = {
        "hash_version": HASH_VERSION,
        "image_id": image_id,
        "model_id": model_id,
        "parameters": _serialize_parameters(parameters),
        "analysis_result": {
            "pore_count": analysis_result.pore_count,
            # Округляем для стабильности сериализации
            "porosity": round(analysis_result.porosity, 6),
            "area": round(analysis_result.area, 6),
            "diameter": round(analysis_result.diameter, 6),
            "size_distribution": analysis_result.size_distribution,
        },
        "images": {
            name: _hash_image(image) for name, image in sorted((images or {}).items())
        },
    }

    # Сериализуем в JSON с сортировкой ключей для консистентности
    data_to_hash = json.dumps(hash_factors, sort_keys=True, default=str)

    # Вычисляем SHA-256 хеш
    return hashlib.sha256(data_to_hash.encode("utf-8")).hexdigest()
