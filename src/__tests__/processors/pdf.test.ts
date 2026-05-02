import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  mergePdfs,
  splitPdf,
  getPdfPageCount,
  rotatePdf,
  compressPdf,
} from "@/lib/processors/pdf";

async function makePdf(pageCount: number): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([200, 200]);
  const bytes = await doc.save();
  return new File([bytes], "test.pdf", { type: "application/pdf" });
}

async function pageCount(blob: Blob): Promise<number> {
  return getPdfPageCount(new File([blob], "out.pdf", { type: "application/pdf" }));
}

// ─── getPdfPageCount ─────────────────────────────────────────────────────────

describe("getPdfPageCount", () => {
  it("returns 1 for a single-page PDF", async () => {
    expect(await getPdfPageCount(await makePdf(1))).toBe(1);
  });
  it("returns the correct count for a multi-page PDF", async () => {
    expect(await getPdfPageCount(await makePdf(7))).toBe(7);
  });
});

// ─── mergePdfs ───────────────────────────────────────────────────────────────

describe("mergePdfs", () => {
  it("combines page counts from two PDFs", async () => {
    const blob = await mergePdfs([await makePdf(2), await makePdf(3)]);
    expect(await pageCount(blob)).toBe(5);
  });
  it("passes a single-file merge through unchanged", async () => {
    const blob = await mergePdfs([await makePdf(4)]);
    expect(await pageCount(blob)).toBe(4);
  });
  it("returns a PDF blob", async () => {
    const blob = await mergePdfs([await makePdf(1)]);
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(0);
  });
});

// ─── splitPdf ────────────────────────────────────────────────────────────────

describe("splitPdf", () => {
  it("extracts an inclusive page range", async () => {
    const blob = await splitPdf(await makePdf(5), 2, 4);
    expect(await pageCount(blob)).toBe(3);
  });
  it("extracts a single page", async () => {
    const blob = await splitPdf(await makePdf(5), 3, 3);
    expect(await pageCount(blob)).toBe(1);
  });
  it("clamps toPage to the document length", async () => {
    const blob = await splitPdf(await makePdf(3), 1, 999);
    expect(await pageCount(blob)).toBe(3);
  });
  it("returns a PDF blob", async () => {
    const blob = await splitPdf(await makePdf(3), 1, 2);
    expect(blob.type).toBe("application/pdf");
  });
});

// ─── rotatePdf ───────────────────────────────────────────────────────────────

describe("rotatePdf", () => {
  it("returns a non-empty PDF blob for 90°", async () => {
    const blob = await rotatePdf(await makePdf(2), 90);
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(0);
  });
  it("returns a non-empty PDF blob for 180°", async () => {
    expect((await rotatePdf(await makePdf(1), 180)).size).toBeGreaterThan(0);
  });
  it("returns a non-empty PDF blob for 270°", async () => {
    expect((await rotatePdf(await makePdf(1), 270)).size).toBeGreaterThan(0);
  });
  it("output is a loadable PDF with the same page count", async () => {
    const blob = await rotatePdf(await makePdf(3), 90);
    expect(await pageCount(blob)).toBe(3);
  });
});

// ─── compressPdf ─────────────────────────────────────────────────────────────

describe("compressPdf", () => {
  it("returns a non-empty PDF blob", async () => {
    const { blob } = await compressPdf(await makePdf(2));
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(0);
  });
  it("originalSize matches the input file size", async () => {
    const file = await makePdf(2);
    const { originalSize } = await compressPdf(file);
    expect(originalSize).toBe(file.size);
  });
  it("compressedSize matches the output blob size", async () => {
    const { blob, compressedSize } = await compressPdf(await makePdf(2));
    expect(compressedSize).toBe(blob.size);
  });
  it("output is a loadable PDF with the same page count", async () => {
    const file = await makePdf(3);
    const { blob } = await compressPdf(file);
    expect(await pageCount(blob)).toBe(3);
  });
});
