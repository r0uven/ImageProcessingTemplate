from io import BytesIO

import cv2
import numpy as np
from fastapi import Response
from PIL import Image

from app.utils.pretty_image import make_pretty_image_plot


def to_pil(image: np.ndarray | Image.Image) -> Image.Image:
    """Приводит OpenCV-массив (BGR/BGRA) к PIL.Image (RGB/RGBA)."""
    if isinstance(image, Image.Image):
        return image
    if image.ndim == 2:
        return Image.fromarray(image)
    if image.ndim != 3:
        raise ValueError("Ожидалось 2D или 3D изображение")
    if image.shape[2] == 1:
        return Image.fromarray(image[:, :, 0])
    if image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2RGBA)
    elif image.shape[2] == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    else:
        raise ValueError("Ожидалось изображение с 1, 3 или 4 каналами")
    return Image.fromarray(image)


def require_pil(image: np.ndarray | Image.Image | None, name: str) -> Image.Image:
    if image is None:
        raise ValueError(f"Изображение '{name}' отсутствует в результате анализа")
    return to_pil(image)


def pretty_mask(image: np.ndarray | None, name: str) -> Image.Image:
    """Рендерит маску в такой же удобный вид, как превью загруженного изображения."""
    if image is None:
        raise ValueError(f"Изображение '{name}' отсутствует в результате анализа")

    mask = image.astype(np.uint8) * 255 if image.dtype == bool else image

    return make_pretty_image_plot(mask, cmap="gray")


def png_response(image: Image.Image) -> Response:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return Response(content=buffer.getvalue(), media_type="image/png")
