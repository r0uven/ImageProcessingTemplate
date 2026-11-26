"""Общие константы API, разделяемые роутерами и сервисами."""

from typing import Literal

# Типы промежуточных изображений, которые можно запросить у запуска анализа.
AnalysisImageType = Literal["preprocessed", "segmentation", "postprocessed", "overlay"]

ANALYSIS_IMAGE_NAMES: tuple[AnalysisImageType, ...] = (
    "preprocessed",
    "segmentation",
    "postprocessed",
    "overlay",
)

# Заголовок-подтверждение, который обязан прислать клиент при удалении модели.
# Браузерный запрос из адресной строки или простая HTML-форма такой заголовок
# задать не могут, поэтому случайное удаление через прямой запрос невозможно.
DELETE_CONFIRMATION_HEADER = "X-Confirm-Delete"
