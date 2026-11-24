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
    available_images: set[str] | None = None,
) -> dict:
    """Формирует ответ как для нового запуска, так и для кэшированного.

    ``available_images`` ограничивает ссылки теми изображениями, которые
    реально сохраняются согласно разделу ``analysis_pipeline``.
    """
    images_url = f"/analysis/{run_id}/images"

    def image_url(name: str) -> str | None:
        if available_images is not None and name not in available_images:
            return None
        return f"{images_url}/{name}"

    return {
        "status": "success",
        "run_id": run_id,
        "image_id": image_id,
        "width": width,
        "height": height,
        "detected_objects": detected_objects,
        "preprocessed_image": image_url("preprocessed"),
        "segmentation_mask": image_url("segmentation"),
        "postprocessed_mask": image_url("postprocessed"),
        "detection_overlay": image_url("overlay"),
    }
