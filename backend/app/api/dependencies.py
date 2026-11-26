"""FastAPI-зависимости, достающие общие объекты из ``app.state``.

Все сервисы и репозитории создаются один раз в ``lifespan`` приложения,
а роутеры получают их через ``Depends`` и аннотированные алиасы ниже.
"""

from typing import Annotated

from fastapi import Depends, Request

from app.database.repositories.analysis_repository import AnalysisRepository
from app.database.repositories.image_repository import ImageRepository
from app.database.repositories.mask_repository import MaskRepository
from app.database.repositories.tool_repository import ToolRepository
from app.modules.image_loader.image_loader import ImageLoader
from app.modules.visualisation.overlay_renderer import OverlayRenderer
from app.pipeline.analysis_pipeline import AnalysisPipeline
from app.storage.image_storage import ImageStorage


def get_storage(request: Request) -> ImageStorage:
    return request.app.state.storage


def get_image_loader(request: Request) -> ImageLoader:
    return request.app.state.image_loader


def get_analysis_pipeline(request: Request) -> AnalysisPipeline:
    return request.app.state.analysis_pipeline


def get_overlay_renderer(request: Request) -> OverlayRenderer:
    return request.app.state.overlay_renderer


def get_image_repository(request: Request) -> ImageRepository:
    return request.app.state.image_repository


def get_analysis_repository(request: Request) -> AnalysisRepository:
    return request.app.state.analysis_repository


def get_mask_repository(request: Request) -> MaskRepository:
    return request.app.state.mask_repository


def get_tool_repository(request: Request) -> ToolRepository:
    return request.app.state.tool_repository


StorageDep = Annotated[ImageStorage, Depends(get_storage)]
LoaderDep = Annotated[ImageLoader, Depends(get_image_loader)]
PipelineDep = Annotated[AnalysisPipeline, Depends(get_analysis_pipeline)]
OverlayDep = Annotated[OverlayRenderer, Depends(get_overlay_renderer)]
ImageRepositoryDep = Annotated[ImageRepository, Depends(get_image_repository)]
AnalysisRepositoryDep = Annotated[AnalysisRepository, Depends(get_analysis_repository)]
MaskRepositoryDep = Annotated[MaskRepository, Depends(get_mask_repository)]
ToolRepositoryDep = Annotated[ToolRepository, Depends(get_tool_repository)]
