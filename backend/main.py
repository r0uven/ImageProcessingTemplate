import base64
from io import BytesIO
import os
import tempfile
import uuid
from app.storage  import ImageStorage



from app.utils.image_encoding import (
    encode_image_to_base64,
    encode_figure_to_base64
)
from fastapi import (
    FastAPI,
    UploadFile,
    File
)

from fastapi.middleware.cors import (
    CORSMiddleware
)

from app.modules.image_loader.image_loader import (
    ImageLoader
)

from app.pipeline.analysis_pipeline import (
    AnalysisPipeline
)

from app.pipeline.pipeline_context import (
    PipelineContext
)

from app.entities.image_data import (
    ImageData
)


app = FastAPI()


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)
storage = ImageStorage()

# =========================
# ROUTES
# =========================

@app.get("/")
def root():

    return {
        "status": "ok"
    }


@app.post("/analyze/{image_id}")
async def analyze_image(image_id: str):

    image = storage.get(image_id)

    image_data = ImageData(
        filename=image_id,
        original_image=image,
        image_shape=image.shape
    )

    pipeline = AnalysisPipeline()

    context = PipelineContext(image_data=image_data)

    result = pipeline.run(context)

    preprocessed_base64 = (
        encode_image_to_base64(
            result.image_data.preprocessed_image
        )
    )

    segmentation_base64 = (
        encode_image_to_base64(
            result.image_data.segmentation_mask
        )
    )

    postprocessed_base64 = (
        encode_image_to_base64(
            result.image_data.postprocessed_mask
        )
    )


    detected_objects = (
        result.analysis_result.objects
    )

    pore_areas = [
        obj.area
        for obj
        in detected_objects
    ]

    mean_area = (
        sum(pore_areas) / len(pore_areas)
        if pore_areas
        else 0
    )

    image_area = (
        image.shape[0]
        * image.shape[1]
    )

    pore_area_sum = sum(pore_areas)

    porosity = (
        pore_area_sum / image_area
    )

    overlay_renderer = OverlayRenderer()

    overlay_figure = (
        overlay_renderer.render_detection_overlay(
            image,
            detected_objects
        )
    )

    overlay_base64 = (
        encode_figure_to_base64(
            overlay_figure
        )
    )

    return {

        "status": "success",


        "detected_objects": len(
            detected_objects
        ),

        "mean_area": mean_area,

        "porosity": porosity,

        "preprocessed_image": preprocessed_base64,

        "segmentation_mask": segmentation_base64,

        "postprocessed_mask": postprocessed_base64,

        "detection_overlay": overlay_base64
    }

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):

    image_bytes = await file.read()

    loader = ImageLoader()

    original, pretty = loader.load_image(
        image_bytes,
        file.filename
    )

    image_id = str(uuid.uuid4())

    storage.save(image_id, original)   # np.ndarray

    buffer = BytesIO()
    pretty.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode()

    return {
        "image_id": image_id,
        "preview": f"data:image/png;base64,{encoded}",
        "width": pretty.width,
        "height": pretty.height
    }