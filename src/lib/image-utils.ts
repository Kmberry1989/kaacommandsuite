export interface CropArea {
  width: number;
  height: number;
  x: number;
  y: number;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = src;
  });
}

export async function resizeDataUrl(
  dataUrl: string,
  width: number,
  height: number,
): Promise<string> {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to get 2D context');
  }
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/png');
}

export async function cropDataUrl(
  dataUrl: string,
  cropArea: CropArea,
  targetWidth: number,
  targetHeight: number,
): Promise<string> {
  const image = await loadImage(dataUrl);
  const cropCanvas = document.createElement('canvas');
  const cropWidth = Math.max(1, Math.round(cropArea.width));
  const cropHeight = Math.max(1, Math.round(cropArea.height));
  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;
  const cropContext = cropCanvas.getContext('2d');
  if (!cropContext) {
    throw new Error('Unable to get 2D context');
  }
  cropContext.drawImage(
    image,
    Math.round(cropArea.x),
    Math.round(cropArea.y),
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  );

  if (cropWidth === targetWidth && cropHeight === targetHeight) {
    return cropCanvas.toDataURL('image/png');
  }

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = targetWidth;
  outputCanvas.height = targetHeight;
  const outputContext = outputCanvas.getContext('2d');
  if (!outputContext) {
    throw new Error('Unable to get 2D context');
  }
  outputContext.drawImage(cropCanvas, 0, 0, targetWidth, targetHeight);
  return outputCanvas.toDataURL('image/png');
}
