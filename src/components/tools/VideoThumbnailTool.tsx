"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { captureVideoFrameAsBlob, getVideoInfo } from "@/lib/processors/video";

const WIDTH_OPTIONS = [320, 640, 1280] as const;
const FORMAT_OPTIONS = ["image/jpeg", "image/png"] as const;

export function VideoThumbnailTool() {
  const t = useTranslations("VideoThumbnail");
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [width, setWidth] = useState<(typeof WIDTH_OPTIONS)[number]>(640);
  const [format, setFormat] = useState<(typeof FORMAT_OPTIONS)[number]>("image/jpeg");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevUrl = useRef<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setError(null);
    setPreviewUrl(null);
    if (prevUrl.current) { URL.revokeObjectURL(prevUrl.current); prevUrl.current = null; }
    try {
      const info = await getVideoInfo(f);
      setDuration(isFinite(info.duration) ? info.duration : 0);
      setTimestamp(0);
    } catch {
      setError(t("errorLoad"));
    }
  }, [t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("video/")) handleFile(f);
  }, [handleFile]);

  const handleCapture = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    if (prevUrl.current) { URL.revokeObjectURL(prevUrl.current); prevUrl.current = null; }

    try {
      const blob = await captureVideoFrameAsBlob(file, timestamp, width, format);
      const url = URL.createObjectURL(blob);
      prevUrl.current = url;
      setPreviewUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }, [file, timestamp, width, format, t]);

  const handleDownload = useCallback(() => {
    if (!previewUrl || !file) return;
    const ext = format === "image/jpeg" ? "jpg" : "png";
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = file.name.replace(/\.[^.]+$/, "") + `-thumbnail.${ext}`;
    a.click();
  }, [previewUrl, file, format]);

  const handleClear = useCallback(() => {
    if (prevUrl.current) { URL.revokeObjectURL(prevUrl.current); prevUrl.current = null; }
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setBusy(false);
    setDuration(0);
    setTimestamp(0);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div role="status" aria-live="polite" className="sr-only">{error ?? ""}</div>

      {/* Drop zone */}
      {!file ? (
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
          <span className="text-sm truncate">{file.name}</span>
          <button type="button" onClick={handleClear} className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-4 shrink-0">
            {t("remove")}
          </button>
        </div>
      )}

      {/* Settings */}
      {file && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t("timestampLabel")}</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={duration > 0 ? duration : undefined}
                  step={0.1}
                  value={timestamp}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setTimestamp(duration > 0 ? Math.min(Math.max(0, v), duration) : Math.max(0, v));
                  }}
                  className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-sm text-muted-foreground">s</span>
                {duration > 0 && (
                  <span className="text-xs text-muted-foreground">/ {formatTime(duration)}</span>
                )}
              </div>
            </div>
            {duration > 0 && (
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={timestamp}
                onChange={(e) => setTimestamp(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("widthLabel")}</label>
              <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
                {WIDTH_OPTIONS.map((w) => (
                  <button key={w} type="button" onClick={() => setWidth(w)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${width === w ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {w}px
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("formatLabel")}</label>
              <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
                {FORMAT_OPTIONS.map((f) => (
                  <button key={f} type="button" onClick={() => setFormat(f)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${format === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {f === "image/jpeg" ? "JPEG" : "PNG"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {file && (
        <Button size="xl" onClick={handleCapture} disabled={busy}>
          {busy ? t("processing") : t("captureButton")}
        </Button>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      )}

      {previewUrl && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/20 p-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Captured frame" className="max-w-full rounded" />
          </div>
          <Button size="xl" onClick={handleDownload}>{t("downloadButton")}</Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
