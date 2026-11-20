from PIL import Image


def upload_response(image_id: str, preview: Image.Image) -> dict:
    return {
        "image_id": image_id,
        "preview_url": f"/images/{image_id}/preview",
        "width": preview.width,
        "height": preview.height,
    }


def analysis_response(
    run_id: str,
    image_id: str,
    width: int,
    height: int,
    detected_objects: int,
) -> dict:
    """Формирует ответ как для нового запуска, так и для кэшированного."""
    images_url = f"/analysis/{run_id}/images"
    return {
        "status": "success",
        "run_id": run_id,
        "image_id": image_id,
        "width": width,
        "height": height,
        "detected_objects": detected_objects,
        "preprocessed_image": f"{images_url}/preprocessed",
        "segmentation_mask": f"{images_url}/segmentation",
        "postprocessed_mask": f"{images_url}/postprocessed",
        "detection_overlay": f"{images_url}/overlay",
    }
