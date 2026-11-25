function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Не удалось прочитать изображение"));
    };

    img.src = url;
  });
}

/**
 * Проверяет, что маска является черно-белым изображением.
 * Если передан оригинал, дополнительно проверяется совпадение размеров
 * (раздел ``training.validate_image_mask_size``).
 */
export const validateMask = async (
  file: File,
  original?: File,
): Promise<boolean> => {
  try {
    const [maskImage, originalImage] = await Promise.all([
      loadImage(file),
      original ? loadImage(original) : Promise.resolve(null),
    ]);

    if (
      originalImage &&
      (maskImage.width !== originalImage.width ||
        maskImage.height !== originalImage.height)
    ) {
      return false;
    }

    const canvas = document.createElement("canvas");

    canvas.width = maskImage.width;
    canvas.height = maskImage.height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return false;
    }

    ctx.drawImage(maskImage, 0, 0);

    const { data } = ctx.getImageData(0, 0, maskImage.width, maskImage.height);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (!(r === g && g === b)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};
