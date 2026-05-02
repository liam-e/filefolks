"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { createZip } from "@/lib/processors/archive";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function ZipFilesTool() {
  const t = useTranslations("ZipFiles");
  const [files, setFiles] = useState<File[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [zipSize, setZipSize] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevUrl = useRef<string | null>(null);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      const next = [...prev];
      for (const f of Array.from(incoming)) {
        if (!existing.has(f.name)) next.push(f);
      }
      return next;
    });
    setZipUrl(null);
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleRemove = useCallback((name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
    setZipUrl(null);
  }, []);

  const handleCreate = useCallback(async () => {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    if (prevUrl.current) { URL.revokeObjectURL(prevUrl.current); prevUrl.current = null; }
    try {
      const blob = await createZip(files);
      const url = URL.createObjectURL(blob);
      prevUrl.current = url;
      setZipUrl(url);
      setZipSize(blob.size);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }, [files, t]);

  const handleDownload = useCallback(() => {
    if (!zipUrl) return;
    const a = document.createElement("a");
    a.href = zipUrl;
    a.download = "archive.zip";
    a.click();
  }, [zipUrl]);

  const handleClear = useCallback(() => {
    if (prevUrl.current) { URL.revokeObjectURL(prevUrl.current); prevUrl.current = null; }
    setFiles([]);
    setZipUrl(null);
    setError(null);
  }, []);

  const totalBytes = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="space-y-6">
      <div role="status" aria-live="polite" className="sr-only">{error ?? ""}</div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-10 cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors"
      >
        <p className="text-sm font-medium">{t("dropLabel")}</p>
        <p className="text-xs text-muted-foreground">{t("dropSublabel")}</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {files.length === 1 ? t("fileCount", { count: 1 }) : t("fileCountPlural", { count: files.length })}
              {" · "}{t("totalSize")}: {formatBytes(totalBytes)}
            </span>
            <button type="button" onClick={handleClear} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t("clearAll")}
            </button>
          </div>
          <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {files.map((f) => (
              <li key={f.name} className="flex items-center justify-between px-4 py-2.5 bg-muted/10 hover:bg-muted/20 transition-colors">
                <span className="text-sm truncate mr-4">{f.name}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                  <button type="button" onClick={() => handleRemove(f.name)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {t("remove")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <Button size="xl" onClick={handleCreate} disabled={busy}>
          {busy ? t("creating") : t("createButton", { count: files.length })}
        </Button>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      )}

      {zipUrl && (
        <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{t("readyTitle")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">archive.zip · {formatBytes(zipSize)}</p>
          </div>
          <Button onClick={handleDownload}>{t("downloadButton")}</Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
