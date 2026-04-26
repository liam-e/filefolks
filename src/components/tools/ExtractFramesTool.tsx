"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { captureVideoFrames, framesToPngBlobs } from "@/lib/processors/video";

const INTERVAL_OPTIONS = [0.5, 1, 2, 5, 10] as const;

export function ExtractFramesTool() {
  const t = useTranslations("ExtractFrames");
  const [file, setFile] = useState<File | null>(null);
  const [interval, setInterval] = useState<(typeof INTERVAL_OPTIONS)[number]>(1);
  const [maxFrames, setMaxFrames] = useState(20);
  const [progress, setProgress] = useState<{ current: number; total: number; phase: "capture" | "encode" } | null>(null);
  const [thumbUrls, setThumbUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevUrls = useRef<string[]>([]);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setThumbUrls([]);
    setError(null);
    setProgress(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("video/")) handleFile(f);
  }, [handleFile]);

  const handleExtract = useCallback(async () => {
    if (!file) return;
    setError(null);
    prevUrls.current.forEach((u) => URL.revokeObjectURL(u));
    prevUrls.current = [];
    setThumbUrls([]);

    try {
      // Capture frames
      const fps = 1 / interval;
      const videoDuration = await getVideoDuration(file);
      const duration = Math.min(videoDuration, maxFrames * interval);

      setProgress({ current: 0, total: Math.ceil(duration * fps), phase: "capture" });

      const frames = await captureVideoFrames(
        file,
        { startTime: 0, duration, fps, width: 480 },
        (current, total) => setProgress({ current, total, phase: "capture" }),
      );

      setProgress({ current: 0, total: frames.length, phase: "encode" });

      const blobs = await framesToPngBlobs(
        frames,
        (current, total) => setProgress({ current, total, phase: "encode" }),
      );

      const urls = blobs.map((b) => URL.createObjectURL(b));
      prevUrls.current = urls;
      setThumbUrls(urls);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setProgress(null);
    }
  }, [file, interval, maxFrames, t]);

  const handleDownloadZip = useCallback(async () => {
    if (!file || thumbUrls.length === 0) return;
    const zip = new JSZip();
    const base = file.name.replace(/\.[^.]+$/, "");

    for (let i = 0; i < thumbUrls.length; i++) {
      const res = await fetch(thumbUrls[i]);
      const buf = await res.arrayBuffer();
      zip.file(`${base}-frame-${String(i + 1).padStart(3, "0")}.png`, buf);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}-frames.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, [file, thumbUrls]);

  const handleClear = useCallback(() => {
    prevUrls.current.forEach((u) => URL.revokeObjectURL(u));
    prevUrls.current = [];
    setFile(null);
    setThumbUrls([]);
    setError(null);
    setProgress(null);
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
            <label className="text-sm font-medium">{t("intervalLabel")}</label>
            <div className="flex flex-wrap gap-1 p-1 bg-muted rounded-lg w-fit">
              {INTERVAL_OPTIONS.map((iv) => (
                <button key={iv} type="button" onClick={() => setInterval(iv)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${interval === iv ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {iv}s
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("maxFramesLabel")}</label>
            <input
              type="number" min={1} max={100} value={maxFrames}
              onChange={(e) => setMaxFrames(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

      {file && (
        <Button size="xl" onClick={handleExtract} disabled={busy}>
          {busy
            ? progress && progress.total > 0
              ? `${progress.phase === "capture" ? t("capturing") : t("encoding")} ${progress.current}/${progress.total}`
              : t("processing")
            : t("extractButton")}
        </Button>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      )}

      {thumbUrls.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{thumbUrls.length} {t("framesLabel")}</span>
            <button type="button" onClick={handleDownloadZip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t("downloadZip")}
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {thumbUrls.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt={`Frame ${i + 1}`}
                className="w-full aspect-video object-cover rounded-lg border border-border"
              />
            ))}
          </div>
          <Button size="xl" onClick={handleDownloadZip}>{t("downloadZip")}</Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}

async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.src = url;
    video.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(isFinite(video.duration) ? video.duration : 60);
    });
    video.addEventListener("error", () => { URL.revokeObjectURL(url); resolve(60); });
    video.load();
  });
}
