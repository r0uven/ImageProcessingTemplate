"""Контекст, который передаётся между шагами пайплайна анализа."""

from dataclasses import dataclass, field

from app.entities.analysis_result import AnalysisResult
from app.entities.image_data import ImageData
from app.entities.pore_object import PoreObject
from app.entities.processing_parameters import ProcessingParameters


@dataclass
class PipelineContext:
    """Мутабельное состояние одного запуска пайплайна.

    Шаги обработки дополняют контекст: загрузчик кладёт ``image_data``,
    детектор — ``objects``, извлечение признаков — ``analysis_result``.
    """

    image_data: ImageData

    objects: list[PoreObject] | None = None

    parameters: ProcessingParameters = field(default_factory=ProcessingParameters)

    analysis_result: AnalysisResult = field(default_factory=AnalysisResult)
