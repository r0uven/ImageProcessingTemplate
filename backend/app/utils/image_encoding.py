import base64
import io

import cv2
import numpy as np

from matplotlib import pyplot as plt


def encode_image_to_base64(
    image: np.ndarray
) -> str:

    if image.dtype == bool:

        image = (
            image.astype(np.uint8) * 255
        )

    success, buffer = cv2.imencode(
        ".png",
        image
    )

    if not success:

        raise RuntimeError(
            "Failed to encode image"
        )

    encoded = base64.b64encode(
        buffer
    ).decode("utf-8")

    return encoded


def encode_figure_to_base64(
    figure
) -> str:

    buffer = io.BytesIO()

    figure.savefig(
        buffer,
        format="png",
        bbox_inches="tight"
    )

    buffer.seek(0)

    encoded = base64.b64encode(
        buffer.read()
    ).decode("utf-8")

    plt.close(figure)

    return encoded