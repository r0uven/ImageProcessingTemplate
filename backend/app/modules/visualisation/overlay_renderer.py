import matplotlib.pyplot as plt
import matplotlib.patches as patches


class OverlayRenderer:

    def render_detection_overlay(
        self,
        image,
        detected_objects
    ):
        fig, ax = plt.subplots(
            figsize=(10, 10)
        )

        # если numpy image
        ax.imshow(image)

        for obj in detected_objects:
            if not hasattr(obj, "bbox"):
                continue

            min_row, min_col, max_row, max_col = obj.bbox

            width = max_col - min_col
            height = max_row - min_row

            rect = patches.Rectangle(
                (min_col, min_row),
                width,
                height,
                linewidth=2,
                edgecolor="red",
                facecolor="none"
            )

            ax.add_patch(rect)

            ax.text(
                min_col,
                min_row,
                f"#{obj.object_id}",
                color="yellow",
                fontsize=10,
                bbox={
                    "facecolor": "black",
                    "alpha": 0.5
                }
            )

        ax.axis("off")

        fig.tight_layout(
            pad=0
        )

        return fig