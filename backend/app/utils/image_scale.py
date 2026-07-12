from PIL import Image

def make_pretty_image(file_bytes: bytes, target_size=1024):
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")

    img.thumbnail((target_size, target_size), Image.Resampling.LANCZOS)

    # upscale to square canvas (optional)
    canvas = Image.new("RGB", (target_size, target_size), (0, 0, 0))
    canvas.paste(
        img,
        ((target_size - img.width) // 2, (target_size - img.height) // 2)
    )

    return canvas