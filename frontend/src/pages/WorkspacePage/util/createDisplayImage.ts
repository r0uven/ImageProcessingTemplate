export async function createDisplayImage(
  source: string,
  minDisplaySize = 1024,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const { width, height } = image;

      const smallestSide = Math.min(width, height);

      const scale =
        smallestSide >= minDisplaySize ? 1 : minDisplaySize / smallestSide;

      const targetWidth = Math.round(width * scale);
      const targetHeight = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        0,
        0,
        width,
        height,
        0,
        0,
        targetWidth,
        targetHeight,
      );

      resolve(canvas.toDataURL("image/png"));
    };

    image.onerror = reject;
    image.src = source;
    console.log(source);
  });
}
