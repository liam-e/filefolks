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
