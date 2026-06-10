"use client";

export interface OcrImageVariant {
  label: string;
  image: File | HTMLCanvasElement;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지 전처리를 위한 로딩에 실패했습니다."));
    };
    image.src = url;
  });
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function drawScaled(image: HTMLImageElement): HTMLCanvasElement {
  const maxDimension = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = maxDimension < 1800 ? 2 : 1.25;
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return canvas;
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

function adjustPixels(
  source: HTMLCanvasElement,
  mode: "contrast" | "threshold"
): HTMLCanvasElement {
  const canvas = createCanvas(source.width, source.height);
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return source;
  }

  context.drawImage(source, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const normalized = Math.max(0, Math.min(255, (gray - 128) * 1.55 + 138));
    const value = mode === "threshold" ? (normalized > 168 ? 255 : 0) : normalized;

    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
}

export async function createOcrImageVariants(file: File): Promise<OcrImageVariant[]> {
  if (typeof document === "undefined") {
    return [{ label: "original", image: file }];
  }

  const image = await loadImage(file);
  const scaled = drawScaled(image);
  const contrast = adjustPixels(scaled, "contrast");
  const threshold = adjustPixels(scaled, "threshold");

  return [
    { label: "contrast-upscaled", image: contrast },
    { label: "threshold-upscaled", image: threshold },
    { label: "original", image: file }
  ];
}
