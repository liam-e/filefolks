"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { captureVideoFrames, encodeGif } from "@/lib/processors/video";

const FPS_OPTIONS = [5, 10, 15] as const;
const WIDTH_OPTIONS = [240, 320, 480] as const;
const MAX_DURATION = 15;

export function VideoToGifTool() {
  const t = useTranslations("VideoToGif");
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [fps, setFps] = useState<(typeof FPS_OPTIONS)[number]>(10);
  const [width, setWidth] = useState<(typeof WIDTH_OPTIONS)[number]>(320);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevGifUrl = useRef<string | null>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setGifUrl(null);
    setError(null);
    setProgress(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("video/")) handleFile(f);
  }, [handleFile]);

  const handleCreate = useCallback(async () => {
    if (!file) return;
    setError(null);
    setProgress({ current: 0, total: 1 });
    if (prevGifUrl.current) URL.revokeObjectURL(prevGifUrl.current);

    try {
      const frames = await captureVideoFrames(
        file,
        { startTime, duration: Math.min(duration, MAX_DURATION), fps, width },
        (current, total) => setProgress({ current, total }),
      );
      const bytes = encodeGif(frames, fps);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "image/gif" });
      const url = URL.createObjectURL(blob);
      prevGifUrl.current = url;
      setGifUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setProgress(null);
    }
  }, [file, startTime, duration, fps, width, t]);

  const handleDownload = useCallback(() => {
    if (!gifUrl || !file) return;
    const a = document.createElement("a");
    a.href = gifUrl;
    a.download = file.name.replace(/\.[^.]+$/, "") + ".gif";
    a.click();
  }, [gifUrl, file]);

  const handleClear = useCallback(() => {
    setFile(null);
    setGifUrl(null);
    setError(null);
    setProgress(null);
    if (prevGifUrl.current) { URL.revokeObjectURL(prevGifUrl.current); prevGifUrl.current = null; }
  }, []);

  const busy = progress !== null;

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
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("startLabel")}</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min={0} step={0.5} value={startTime}
                onChange={(e) => setStartTime(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">s</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("durationLabel")} (max {MAX_DURATION}s)</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min={1} max={MAX_DURATION} step={0.5} value={duration}
                onChange={(e) => setDuration(Math.min(MAX_DURATION, Math.max(1, parseFloat(e.target.value) || 1)))}
                className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">s</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("fpsLabel")}</label>
            <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
              {FPS_OPTIONS.map((f) => (
                <button key={f} type="button" onClick={() => setFps(f)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${fps === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

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
        </div>
      )}

      {file && (
        <Button size="xl" onClick={handleCreate} disabled={busy}>
          {busy
            ? progress && progress.total > 0
              ? `${t("processing")} ${progress.current}/${progress.total}`
              : t("processing")
            : t("createButton")}
        </Button>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      )}

      {gifUrl && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/20 p-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gifUrl} alt="Generated GIF" className="max-w-full rounded" />
          </div>
          <Button size="xl" onClick={handleDownload}>{t("downloadButton")}</Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
