from io import BytesIO

import numpy as np
from PIL import Image


def image_to_buffer(image):
    buffer = BytesIO()

    if isinstance(image, np.ndarray):
        # если bool маска
        if image.dtype == bool:
            image = image.astype(np.uint8) * 255

        # если grayscale
        if image.ndim == 2:
            pil_image = Image.fromarray(image)

        # если RGB
        else:
            pil_image = Image.fromarray(image)

        pil_image.save(buffer, format="PNG")

    else:
        # PIL Image
        image.save(buffer, format="PNG")

    buffer.seek(0)

    return buffer
