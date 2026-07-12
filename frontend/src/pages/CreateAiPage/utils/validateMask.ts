export const validateMask = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(false);
        return;
      }

      ctx.drawImage(img, 0, 0);

      const { data } = ctx.getImageData(0, 0, img.width, img.height);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (!(r === g && g === b)) {
          resolve(false);
          return;
        }
      }

      resolve(true);
    };

    img.src = URL.createObjectURL(file);
  });
};
