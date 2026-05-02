import JSZip from "jszip";

export async function createZip(files: File[]): Promise<Blob> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file);
  }
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export interface ZipEntry {
  path: string;
  isDirectory: boolean;
}

export async function listZipEntries(file: File): Promise<ZipEntry[]> {
  const zip = await JSZip.loadAsync(file);
  const entries: ZipEntry[] = [];
  zip.forEach((path, entry) => {
    entries.push({ path, isDirectory: entry.dir });
  });
  return entries.sort((a, b) => a.path.localeCompare(b.path));
}

export async function extractZipEntry(zipFile: File, entryPath: string): Promise<Blob> {
  const zip = await JSZip.loadAsync(zipFile);
  const entry = zip.file(entryPath);
  if (!entry) throw new Error(`File not found in archive: ${entryPath}`);
  return entry.async("blob");
}
