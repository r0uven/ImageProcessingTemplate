"""Снимок настроек, которые повлияли на конкретный запуск анализа.

Настройки в settings.json могут измениться после обработки, поэтому страница
результатов не может читать текущий файл: нужен снимок на момент запуска.
Снимок состоит из двух частей:

- ``request`` — параметры, пришедшие от клиента в AnalyzeRequest;
- ``global`` — секции settings.json, которые влияют на результат, но не
  входят в запрос (тот же набор, что и в хеше запуска).
"""

import copy
import json
from dataclasses import asdict
from typing import Any

from app.config.config_loader import APP_SETTINGS, RESULT_SETTINGS_SECTIONS
from app.mappers.processing_parameters_mapper import to_processing_parameters
from app.schemas.analyze_request import AnalyzeRequest

SNAPSHOT_VERSION = 1


def build_settings_snapshot(parameters: AnalyzeRequest) -> dict[str, Any]:
    """Возвращает JSON-совместимый снимок параметров запуска."""
    request_parameters = json.loads(
        json.dumps(
            asdict(to_processing_parameters(parameters)),
            sort_keys=True,
            default=str,
        )
    )
    # Случайный клиентский ID набора параметров не влияет на результат.
    request_parameters.pop("parameters_id", None)

    return {
        "version": SNAPSHOT_VERSION,
        "request": request_parameters,
        "global": {
            section: copy.deepcopy(APP_SETTINGS[section])
            for section in RESULT_SETTINGS_SECTIONS
        },
    }
