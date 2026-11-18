import io

import matplotlib

matplotlib.use("Agg")
import numpy as np
from matplotlib import pyplot as plt
from matplotlib.axes import Axes
from PIL import Image


def make_pretty_image_plot(
    image: np.ndarray | Image.Image,
    dpi: int = 150,
    figsize: tuple[float, float] = (6, 6),
    cmap: str | None = None,
) -> Image.Image:
    """Рендерит изображение в фиксированный "красивый" вид для просмотра.

    Результат не зависит от исходного разрешения: размер задаётся figsize/dpi.
    Используется как для превью загруженных изображений, так и для масок,
    которые иначе выглядят слишком мелкими в интерфейсе.
    """
    figsize = (float(figsize[0]), float(figsize[1]))

    fig = plt.figure(figsize=figsize, dpi=int(dpi))
    ax = Axes(fig, (0, 0, 1, 1))
    ax.set_axis_off()
    fig.add_axes(ax)

    ax.imshow(image, cmap=cmap)

    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", pad_inches=0)

    plt.close(fig)

    buf.seek(0)

    return Image.open(buf).convert("RGB")
