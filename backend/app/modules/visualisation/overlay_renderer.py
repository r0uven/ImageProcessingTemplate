import io

import matplotlib
import numpy as np

matplotlib.use("Agg")
from app.entities.pore_object import PoreObject
from matplotlib import patches
from matplotlib import pyplot as plt
from matplotlib.axes import Axes
from PIL import Image


class OverlayRenderer:
    def render_detection_overlay(
        self,
        image: np.ndarray,
        detected_objects: list[PoreObject],
    ) -> Image.Image:
        fig = plt.figure(figsize=(10, 10), dpi=150)

        ax = Axes(fig, (0, 0, 1, 1))
        ax.set_axis_off()
        fig.add_axes(ax)

        ax.imshow(image, cmap="gray")

        for obj in detected_objects:
            if obj.bounding_box is None:
                continue

            min_row, min_col, max_row, max_col = obj.bounding_box

            width = max_col - min_col
            height = max_row - min_row

            rect = patches.Rectangle(
                (min_col, min_row),
                width,
                height,
                linewidth=2,
                edgecolor="red",
                facecolor="none",
            )

            ax.add_patch(rect)

            ax.text(
                min_col,
                min_row,
                f"#{obj.object_id}",
                color="yellow",
                fontsize=10,
                bbox={"facecolor": "black", "alpha": 0.5},
            )

        buf = io.BytesIO()

        fig.savefig(
            buf,
            format="png",
            bbox_inches="tight",
            pad_inches=0,
            dpi=150,
        )

        plt.close(fig)

        buf.seek(0)

        return Image.open(buf).convert("RGB")
