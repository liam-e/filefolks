import { GIFEncoder, quantize, applyPalette } from "gifenc";

export interface VideoFrameOptions {
  startTime: number;
  duration: number;
  fps: number;
  width: number;
}

export interface CapturedFrame {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export async function captureVideoFrames(
  file: File,
  options: VideoFrameOptions,
  onProgress?: (current: number, total: number) => void,
): Promise<CapturedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    const frames: CapturedFrame[] = [];
    const frameCount = Math.max(1, Math.round(options.duration * options.fps));
    let currentFrame = 0;
    let canvasW = 0;
    let canvasH = 0;
    const canvas = document.createElement("canvas");

    video.addEventListener("loadedmetadata", () => {
      const aspect = video.videoHeight / video.videoWidth;
      canvasW = options.width;
      canvasH = Math.round(options.width * aspect);
      // GIF dimensions must be even
      if (canvasH % 2 !== 0) canvasH += 1;
      canvas.width = canvasW;
      canvas.height = canvasH;
      video.currentTime = options.startTime;
    });

    video.addEventListener("seeked", () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not available")); return; }
      ctx.drawImage(video, 0, 0, canvasW, canvasH);
      const imageData = ctx.getImageData(0, 0, canvasW, canvasH);
      frames.push({ data: imageData.data, width: canvasW, height: canvasH });
      onProgress?.(currentFrame + 1, frameCount);
      currentFrame++;

      if (currentFrame < frameCount) {
        video.currentTime = options.startTime + currentFrame * (1 / options.fps);
      } else {
        URL.revokeObjectURL(url);
        resolve(frames);
      }
    });

    video.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load video. The format may not be supported by your browser."));
    });

    video.load();
  });
}

export function encodeGif(frames: CapturedFrame[], fps: number): Uint8Array {
  const delay = Math.round(100 / fps); // centiseconds
  const gif = GIFEncoder();

  for (const frame of frames) {
    const palette = quantize(frame.data, 256);
    const index = applyPalette(frame.data, palette);
    gif.writeFrame(index, frame.width, frame.height, { palette, delay });
  }

  gif.finish();
  return gif.bytes();
}

export async function framesToPngBlobs(
  frames: CapturedFrame[],
  onProgress?: (current: number, total: number) => void,
): Promise<Blob[]> {
  const canvas = document.createElement("canvas");
  const blobs: Blob[] = [];

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    canvas.width = frame.width;
    canvas.height = frame.height;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(new ImageData(new Uint8ClampedArray(frame.data), frame.width, frame.height), 0, 0);
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png")
    );
    blobs.push(blob);
    onProgress?.(i + 1, frames.length);
  }

  return blobs;
}
