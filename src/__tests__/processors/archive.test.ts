import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { createZip, listZipEntries, extractZipEntry } from "@/lib/processors/archive";

async function makeZipFile(entries: Record<string, string>): Promise<File> {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(entries)) zip.file(name, content);
  const blob = await zip.generateAsync({ type: "blob" });
  return new File([blob], "test.zip", { type: "application/zip" });
}

// ─── createZip ───────────────────────────────────────────────────────────────

describe("createZip", () => {
  it("returns a non-empty blob", async () => {
    const blob = await createZip([new File(["hello"], "hello.txt")]);
    expect(blob.size).toBeGreaterThan(0);
  });
  it("zip contains all input filenames", async () => {
    const files = [new File(["a"], "a.txt"), new File(["b"], "b.txt")];
    const blob = await createZip(files);
    const zipFile = new File([blob], "out.zip");
    const entries = await listZipEntries(zipFile);
    const paths = entries.map((e) => e.path);
    expect(paths).toContain("a.txt");
    expect(paths).toContain("b.txt");
  });
  it("preserves file contents through a zip roundtrip", async () => {
    const content = "hello content";
    const blob = await createZip([new File([content], "file.txt")]);
    const extracted = await extractZipEntry(new File([blob], "out.zip"), "file.txt");
    expect(await extracted.text()).toBe(content);
  });
  it("uses DEFLATE compression (output smaller than naive concatenation for compressible data)", async () => {
    const big = new File([new Array(1000).fill("aaaa").join("")], "big.txt");
    const blob = await createZip([big]);
    expect(blob.size).toBeLessThan(big.size);
  });
});

// ─── listZipEntries ──────────────────────────────────────────────────────────

describe("listZipEntries", () => {
  it("returns entries sorted alphabetically by path", async () => {
    const zipFile = await makeZipFile({ "z.txt": "z", "a.txt": "a", "m.txt": "m" });
    const paths = (await listZipEntries(zipFile)).map((e) => e.path);
    expect(paths).toEqual(["a.txt", "m.txt", "z.txt"]);
  });
  it("marks regular files as non-directory", async () => {
    const zipFile = await makeZipFile({ "file.txt": "content" });
    const entries = await listZipEntries(zipFile);
    expect(entries[0].isDirectory).toBe(false);
  });
  it("returns an empty array for an empty zip", async () => {
    const blob = await new JSZip().generateAsync({ type: "blob" });
    const zipFile = new File([blob], "empty.zip");
    expect(await listZipEntries(zipFile)).toHaveLength(0);
  });
  it("returns one entry per file", async () => {
    const zipFile = await makeZipFile({ "a.txt": "a", "b.txt": "b", "c.txt": "c" });
    expect(await listZipEntries(zipFile)).toHaveLength(3);
  });
});

// ─── extractZipEntry ─────────────────────────────────────────────────────────

describe("extractZipEntry", () => {
  it("extracts the correct file content", async () => {
    const zipFile = await makeZipFile({ "hello.txt": "hello world" });
    const blob = await extractZipEntry(zipFile, "hello.txt");
    expect(await blob.text()).toBe("hello world");
  });
  it("extracts the right file when multiple entries exist", async () => {
    const zipFile = await makeZipFile({ "a.txt": "content-a", "b.txt": "content-b" });
    expect(await (await extractZipEntry(zipFile, "a.txt")).text()).toBe("content-a");
    expect(await (await extractZipEntry(zipFile, "b.txt")).text()).toBe("content-b");
  });
  it("throws an error for a non-existent entry path", async () => {
    const zipFile = await makeZipFile({ "exists.txt": "content" });
    await expect(extractZipEntry(zipFile, "missing.txt")).rejects.toThrow("missing.txt");
  });
});
