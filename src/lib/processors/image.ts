export type ImageFormat = "image/png" | "image/jpeg" | "image/webp";

export const FORMAT_EXT: Record<ImageFormat, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export const FORMAT_LABEL: Record<ImageFormat, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/webp": "WebP",
};

export const IMAGE_ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

export interface CompressImageResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
}

export async function compressImage(file: File): Promise<CompressImageResult> {
  const { default: imageCompression } = await import("browser-image-compression");
  const originalSize = file.size;
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    useWebWorker: true,
  });
  return { blob: compressed, originalSize, compressedSize: compressed.size };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(targetWidth));
  canvas.height = Math.max(1, Math.round(targetHeight));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const mime = (["image/jpeg", "image/webp"].includes(file.type) ? file.type : "image/png") as ImageFormat;
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Resize failed"))),
      mime,
      mime === "image/png" ? undefined : 0.92
    );
  });
}

export async function cropImage(
  file: File,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Blob> {
  const img = await loadImage(file);
  const sx = Math.round(x), sy = Math.round(y);
  const sw = Math.round(width), sh = Math.round(height);
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  const mime = (["image/jpeg", "image/webp"].includes(file.type) ? file.type : "image/png") as ImageFormat;
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))),
      mime,
      mime === "image/png" ? undefined : 0.92
    );
  });
}

export async function convertImage(
  file: File,
  targetFormat: ImageFormat,
  quality = 0.92
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  if (targetFormat === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Conversion failed"))),
      targetFormat,
      quality
    );
  });
}
