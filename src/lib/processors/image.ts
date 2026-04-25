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
