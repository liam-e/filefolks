export async function mergePdfs(files: File[]): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const merged = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const mergedBytes = await merged.save();
  return new Blob([mergedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

export async function getPdfPageCount(file: File): Promise<number> {
  const { PDFDocument } = await import("pdf-lib");
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  return doc.getPageCount();
}

export async function splitPdf(
  file: File,
  fromPage: number, // 1-indexed, inclusive
  toPage: number    // 1-indexed, inclusive
): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const total = src.getPageCount();
  const from = Math.max(0, fromPage - 1);
  const to = Math.min(total - 1, toPage - 1);
  const indices = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  const outBytes = await out.save();
  return new Blob([outBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

async function fileToPngBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not available"));
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) return reject(new Error("PNG conversion failed"));
        resolve(new Uint8Array(await blob.arrayBuffer()));
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

export async function imagesToPdf(files: File[]): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();

  for (const file of files) {
    let img;
    if (file.type === "image/jpeg") {
      img = await doc.embedJpg(await file.arrayBuffer());
    } else {
      const pngBytes = await fileToPngBytes(file);
      img = await doc.embedPng(pngBytes);
    }
    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }

  const outBytes = await doc.save();
  return new Blob([outBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

export async function rotatePdf(
  file: File,
  rotation: 90 | 180 | 270
): Promise<Blob> {
  const { PDFDocument, degrees } = await import("pdf-lib");
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  doc.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation) % 360));
  });
  const outBytes = await doc.save();
  return new Blob([outBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

export interface CompressResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
}

export async function compressPdf(file: File): Promise<CompressResult> {
  const { PDFDocument } = await import("pdf-lib");
  const originalSize = file.size;
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);

  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setProducer("");
  doc.setCreator("");

  const compressedBytes = await doc.save({ useObjectStreams: true });
  const blob = new Blob([compressedBytes.buffer as ArrayBuffer], { type: "application/pdf" });

  return { blob, originalSize, compressedSize: blob.size };
}
