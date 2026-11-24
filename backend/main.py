import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager, suppress
from pathlib import Path

from app.api.routers import analysis, history, images, settings, system, tools, uploads
from app.database.connection import get_connection
from app.database.migrator import run_migrations
from app.database.repositories.analysis_repository import AnalysisRepository
from app.database.repositories.image_repository import ImageRepository
from app.database.repositories.tool_repository import ToolRepository
from app.modules.image_loader.image_loader import ImageLoader
from app.modules.visualisation.overlay_renderer import OverlayRenderer
from app.pipeline.analysis_pipeline import AnalysisPipeline
from app.storage.image_storage import ImageStorage
from fastapi import FastAPI, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware

LOG_PATH = Path(__file__).resolve().parent / "app.log"

logging.basicConfig(
    filename=LOG_PATH,
    level=logging.INFO,
    encoding="utf-8",
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


async def _cleanup_cache_periodically(storage: ImageStorage) -> None:
    """Постепенно удаляет самые старые превью, пока приложение работает."""
    while True:
        try:
            await run_in_threadpool(storage.cleanup_cache)
        except Exception:
            logger.exception("Cache cleanup failed")

        await asyncio.sleep(storage.cleanup_interval_seconds)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Поднимает БД, миграции и сервисы; закрывает соединение при остановке."""
    db = get_connection()
    cleanup_task: asyncio.Task | None = None

    try:
        run_migrations(db)

        app.state.db = db
        app.state.storage = ImageStorage()
        app.state.tool_repository = ToolRepository(db)
        app.state.analysis_repository = AnalysisRepository(db)
        app.state.image_repository = ImageRepository(db)
        app.state.image_loader = ImageLoader()
        app.state.analysis_pipeline = AnalysisPipeline()
        app.state.overlay_renderer = OverlayRenderer()

        cleanup_task = asyncio.create_task(
            _cleanup_cache_periodically(app.state.storage)
        )

        logger.info("Application started")
        yield
    finally:
        if cleanup_task is not None:
            cleanup_task.cancel()
            with suppress(asyncio.CancelledError):
                await cleanup_task

        db.close()
        logger.info("Application stopped")


app = FastAPI(title="Image Analysis API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (
    system.router,
    settings.router,
    uploads.router,
    analysis.router,
    images.router,
    tools.router,
    history.router,
):
    app.include_router(router)


@app.middleware("http")
async def log_health_requests(request: Request, call_next):
    """Пишет в лог клиентов, которые опрашивают /health."""
    if request.url.path == "/health":
        logger.debug(
            "Health check: ua=%s origin=%s referer=%s host=%s",
            request.headers.get("user-agent"),
            request.headers.get("origin"),
            request.headers.get("referer"),
            request.headers.get("host"),
        )
    return await call_next(request)
