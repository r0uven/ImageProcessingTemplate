import uuid
from contextlib import asynccontextmanager
from io import BytesIO

from app.database.connection import get_connection
from app.database.migrator import run_migrations
from app.database.repositories.tool_repository import ToolRepository
from app.entities.image_data import ImageData
from app.modules.image_loader.image_loader import ImageLoader
from app.modules.visualisation.overlay_renderer import OverlayRenderer
from app.pipeline.analysis_pipeline import AnalysisPipeline
from app.pipeline.pipeline_context import PipelineContext
from app.schemas.analyze_request import AnalyzeRequest
from app.storage.image_storage import ImageStorage
from app.utils.converterToPillow import image_to_buffer
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse


@asynccontextmanager
async def lifespan(app: FastAPI):

    # БД
    db = get_connection()

    run_migrations(db)

    # Хранилище временных изображений
    storage = ImageStorage()

    # Репозитории
    tool_repository = ToolRepository(db)

    # кладём зависимости в приложение
    app.state.db = db
    app.state.storage = storage
    app.state.tool_repository = tool_repository

    yield

    # shutdown
    db.close()


app = FastAPI(lifespan=lifespan)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ROUTES
# =========================


@app.get("/")
def root():

    return {"status": "ok"}


@app.post("/analyze/{image_id}")
async def analyze_image(image_id: str, parametrs: AnalyzeRequest):
    storage = app.state.storage
    image = storage.get(image_id)

    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")

    image_data = ImageData(
        filename=image_id, original_image=image, image_shape=image.size
    )

    pipeline = AnalysisPipeline()

    context = PipelineContext(image_data=image_data)

    result = pipeline.run(context)

    detected_objects = result.analysis_result.objects

    overlay_renderer = OverlayRenderer()

    overlay_figure = overlay_renderer.render_detection_overlay(image, detected_objects)

    storage.save_analysis_image(
        image_id, "preprocessed", result.image_data.preprocessed_image
    )

    storage.save_analysis_image(
        image_id, "segmentation", result.image_data.segmentation_mask
    )

    storage.save_analysis_image(
        image_id, "postprocessed", result.image_data.postprocessed_mask
    )

    storage.save_analysis_image(image_id, "overlay", overlay_figure)

    return {
        "status": "success",
        "image_id": image_id,
        "width": None,
        "height": None,
        "detected_objects": result.analysis_result.detected_objects_count,
        "mean_area": result.analysis_result.mean_area,
        "porosity": result.analysis_result.porosity,
        "preprocessed_image": f"/images/{image_id}/preprocessed",
        "segmentation_mask": f"/images/{image_id}/segmentation",
        "postprocessed_mask": f"/images/{image_id}/postprocessed",
        "detection_overlay": f"/images/{image_id}/overlay",
    }


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    image_bytes = await file.read()

    loader = ImageLoader()

    original, pretty = loader.load_image(image_bytes, file.filename)

    image_id = str(uuid.uuid4())

    storage.save(image_id, original)
    print("saved:", image_id)
    # сохраняем превью
    storage.save_preview(image_id, pretty)

    return {
        "image_id": image_id,
        "preview_url": f"/images/{image_id}/preview",
        "width": pretty.width,
        "height": pretty.height,
    }


@app.get("/images/{image_id}/preview")
async def get_preview(image_id: str):
    print("requested:", image_id)

    image = storage.get_preview(image_id)

    print("image:", image)
    print("size:", image.size)

    buffer = BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="image/png")


@app.get("/images/{image_id}/{image_type}")
async def get_analysis_image(image_id: str, image_type: str):
    image = storage.get_analysis_image(image_id, image_type)

    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")

    buffer = image_to_buffer(image)

    return StreamingResponse(buffer, media_type="image/png")
