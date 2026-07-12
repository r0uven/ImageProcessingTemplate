from pathlib import Path
import cv2
import numpy as np
import io
from PIL import Image
from matplotlib import pyplot as plt

from app.config.config_loader import APP_SETTINGS


class ImageLoader:

    def load_image(self, file_bytes: bytes, filename: str):
        image_settings = APP_SETTINGS["image"]

        allowed_formats = image_settings["allowed_formats"]
        resize_on_load = image_settings["resize_on_load"]
        default_size = image_settings["default_size"]

        file_extension = Path(filename).suffix.lower().lstrip(".")

        if file_extension not in allowed_formats:
            raise ValueError(f"Unsupported file format: {file_extension}")

        image_array = np.frombuffer(file_bytes, np.uint8)

        original_image = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR
        )

        if original_image is None:
            raise ValueError("Failed to decode image")

        if resize_on_load:
            original_image = cv2.resize(original_image, tuple(default_size))

        # convert BGR → RGB for PIL
        rgb_image = cv2.cvtColor(original_image, cv2.COLOR_BGR2RGB)

        pretty_image = self.make_pretty_image_plot(
            rgb_image
        )

        return original_image, pretty_image

    def make_pretty_image_plot(self, image: np.ndarray, dpi: int = 150, figsize=(6, 6)) -> Image.Image:

        figsize = tuple(float(x) for x in figsize)

        fig = plt.figure(figsize=figsize, dpi=int(dpi))
        ax = plt.Axes(fig, [0, 0, 1, 1])
        ax.set_axis_off()
        fig.add_axes(ax)

        ax.imshow(image)

        buf = io.BytesIO()
        fig.savefig(buf, format="png", bbox_inches="tight", pad_inches=0)

        plt.close(fig)

        buf.seek(0)

        img = Image.open(buf).convert("RGB")

        return img