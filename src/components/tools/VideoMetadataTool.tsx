"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { getVideoInfo } from "@/lib/processors/video";

interface VideoMeta {
  fileName: string;
  fileSize: number;
  fileType: string;
  duration: number;
  width: number;
  height: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDuration(seconds: number): string {
  if (!isFinite(seconds)) return "Unknown";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function aspectRatio(w: number, h: number): string {
  if (w === 0 || h === 0) return "Unknown";
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

function estimatedBitrate(bytes: number, durationSec: number): string {
  if (!isFinite(durationSec) || durationSec <= 0) return "Unknown";
  const kbps = (bytes * 8) / durationSec / 1000;
  if (kbps >= 1000) return `~${(kbps / 1000).toFixed(1)} Mbps`;
  return `~${Math.round(kbps)} Kbps`;
}

export function VideoMetadataTool() {
  const t = useTranslations("VideoMetadata");
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setMeta(null);
    try {
      const info = await getVideoInfo(f);
      setMeta({
        fileName: f.name,
        fileSize: f.size,
        fileType: f.type || "Unknown",
        duration: info.duration,
        width: info.width,
        height: info.height,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    }
  }, [t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("video/")) handleFile(f);
  }, [handleFile]);

  const handleClear = useCallback(() => {
    setMeta(null);
    setError(null);
  }, []);

  const rows = meta ? [
    { label: t("fileName"), value: meta.fileName },
    { label: t("fileSize"), value: formatBytes(meta.fileSize) },
    { label: t("fileType"), value: meta.fileType },
    { label: t("duration"), value: formatDuration(meta.duration) },
    { label: t("resolution"), value: meta.width && meta.height ? `${meta.width} × ${meta.height}` : "Unknown" },
    { label: t("aspectRatio"), value: meta.width && meta.height ? aspectRatio(meta.width, meta.height) : "Unknown" },
    { label: t("estimatedBitrate"), value: estimatedBitrate(meta.fileSize, meta.duration) },
  ] : [];

  return (
    <div className="space-y-6">
      <div role="status" aria-live="polite" className="sr-only">{error ?? ""}</div>

      {/* Drop zone */}
      {!meta ? (
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
            accept="video/*"
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
          <span className="text-sm truncate">{meta.fileName}</span>
          <button type="button" onClick={handleClear} className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-4 shrink-0">
            {t("remove")}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                  <td className="px-4 py-3 font-medium text-muted-foreground w-2/5">{row.label}</td>
                  <td className="px-4 py-3 break-all">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
