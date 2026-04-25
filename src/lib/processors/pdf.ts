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
