import io

import matplotlib.pyplot as plt
from matplotlib import patches
from PIL import Image


class OverlayRenderer:
    def render_detection_overlay(self, image, detected_objects):
        fig = plt.figure(figsize=(10, 10), dpi=150)

        ax = plt.Axes(fig, [0, 0, 1, 1])
        ax.set_axis_off()
        fig.add_axes(ax)

        ax.imshow(image, cmap="gray")

        for obj in detected_objects:
            if not hasattr(obj, "bounding_box"):
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

        img = Image.open(buf).convert("RGB")

        return img
