"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { listZipEntries, extractZipEntry, type ZipEntry } from "@/lib/processors/archive";

export function UnzipFilesTool() {
  const t = useTranslations("UnzipFiles");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<ZipEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    setZipFile(f);
    setEntries([]);
    setError(null);
    setLoading(true);
    try {
      const list = await listZipEntries(f);
      setEntries(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDownload = useCallback(async (entryPath: string) => {
    if (!zipFile) return;
    setDownloading(entryPath);
    try {
      const blob = await extractZipEntry(zipFile, entryPath);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = entryPath.split("/").pop() ?? entryPath;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setDownloading(null);
    }
  }, [zipFile, t]);

  const handleClear = useCallback(() => {
    setZipFile(null);
    setEntries([]);
    setError(null);
    setLoading(false);
  }, []);

  const fileEntries = entries.filter((e) => !e.isDirectory);
  const dirCount = entries.length - fileEntries.length;

  return (
    <div className="space-y-6">
      <div role="status" aria-live="polite" className="sr-only">{error ?? ""}</div>

      {/* Drop zone */}
      {!zipFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-14 cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors"
        >
          <p className="text-sm font-medium">{t("dropLabel")}</p>
          <p className="text-xs text-muted-foreground">{t("dropSublabel")}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
          <span className="text-sm truncate">{zipFile.name}</span>
          <button type="button" onClick={handleClear} className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-4 shrink-0">
            {t("remove")}
          </button>
        </div>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground text-center py-4">{t("loading")}</p>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      )}

      {fileEntries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {fileEntries.length === 1 ? t("fileCount", { count: 1 }) : t("fileCountPlural", { count: fileEntries.length })}
              {dirCount > 0 && ` · ${dirCount} ${t("folders")}`}
            </span>
          </div>
          <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden max-h-96 overflow-y-auto">
            {fileEntries.map((entry) => (
              <li key={entry.path} className="flex items-center justify-between px-4 py-2.5 bg-muted/10 hover:bg-muted/20 transition-colors">
                <span className="text-sm truncate mr-4 font-mono text-xs">{entry.path}</span>
                <button
                  type="button"
                  onClick={() => handleDownload(entry.path)}
                  disabled={downloading === entry.path}
                  className="text-xs font-medium text-primary hover:underline disabled:opacity-50 shrink-0"
                >
                  {downloading === entry.path ? "…" : t("download")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
