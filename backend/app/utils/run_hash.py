"""Утилиты для генерирования детерминированного хеша запуска анализа."""

import hashlib
import json
from dataclasses import asdict
from typing import Any

from app.config.config_loader import APP_SETTINGS
from app.mappers.processing_parameters_mapper import to_processing_parameters
from app.schemas.analyze_request import AnalyzeRequest

# Версия схемы хеширования. Меняется при изменении состава факторов
# или логики обработки, чтобы старые и новые хеши не пересекались.
HASH_VERSION = 3

# Глобальные секции settings.json, которые влияют на результат обработки,
# но не приходят в AnalyzeRequest. Их изменение должно сбрасывать кэш.
_GLOBAL_RESULT_SETTINGS = (
    "image",
    "postprocessing",
    "object_detection",
    "feature_extraction",
)


def _serialize_parameters(parameters: AnalyzeRequest) -> dict[str, Any]:
    """Сериализует параметры обработки для хеширования.

    ``parametersId`` — случайный идентификатор набора параметров, который
    генерируется клиентом. Он не влияет на результат обработки, поэтому
    исключается из хеша: одинаковые параметры должны давать одинаковый хеш.
    """
    serialized = json.loads(
        json.dumps(
            asdict(to_processing_parameters(parameters)),
            sort_keys=True,
            default=str,
        )
    )
    serialized.pop("parameters_id", None)
    return serialized


def compute_run_hash(
    image_id: str,
    model_id: str,
    parameters: AnalyzeRequest,
) -> str:
    """
    Вычисляет детерминированный SHA-256 хеш запуска по входным данным.

    Хеш используется как идентификатор запуска, имя подпапки с картинками
    и ключ кэша. Поэтому он зависит только от того, что влияет на обработку:
    - ID исходного изображения (image_id);
    - ID используемой модели (model_id);
    - параметров обработки (все параметры из AnalyzeRequest);
    - глобальных настроек, которые не входят в запрос, но влияют на
      результат (image, postprocessing, object_detection, feature_extraction).

    Результаты обработки (характеристики, маски, overlay) намеренно не входят
    в хеш: при неизменных входных данных они не меняются, а для проверки кэша
    их вычисление не требуется.

    Args:
        image_id: Идентификатор исходного изображения
        model_id: Идентификатор используемой модели
        parameters: Параметры обработки изображения

    Returns:
        SHA-256 хеш в hex-формате (64 символа)
    """
    # Собираем все входные факторы в один объект для хеширования
    hash_factors = {
        "hash_version": HASH_VERSION,
        "image_id": image_id,
        "model_id": model_id,
        "parameters": _serialize_parameters(parameters),
        "global_settings": {
            section: APP_SETTINGS[section] for section in _GLOBAL_RESULT_SETTINGS
        },
    }

    # Сериализуем в JSON с сортировкой ключей для консистентности
    data_to_hash = json.dumps(hash_factors, sort_keys=True, default=str)

    # Вычисляем SHA-256 хеш
    return hashlib.sha256(data_to_hash.encode("utf-8")).hexdigest()
