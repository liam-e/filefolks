"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { resizeImage, getImageDimensions, IMAGE_ACCEPT } from "@/lib/processors/image";
import { downloadBlob } from "@/lib/utils/file";

type Status = "idle" | "loading" | "ready" | "resizing" | "done" | "error";
type Mode = "pixels" | "percent";

export function ImageResizerTool() {
  const t = useTranslations("ImageResizer");
  const [file, setFile] = useState<File | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [mode, setMode] = useState<Mode>("pixels");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [scale, setScale] = useState(100);
  const [locked, setLocked] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (incoming: File[]) => {
    const picked = incoming[0];
    if (!picked) return;
    setFile(picked);
    setStatus("loading");
    setError(null);
    try {
      const { width: w, height: h } = await getImageDimensions(picked);
      setNatural({ w, h });
      setWidth(w);
      setHeight(h);
      setScale(100);
      setStatus("ready");
    } catch {
      setError("Could not read image dimensions.");
      setStatus("error");
    }
  }, []);

  const handleWidthChange = useCallback((val: number) => {
    const v = Math.max(1, val);
    setWidth(v);
    if (locked && natural) setHeight(Math.max(1, Math.round(natural.h * (v / natural.w))));
  }, [locked, natural]);

  const handleHeightChange = useCallback((val: number) => {
    const v = Math.max(1, val);
    setHeight(v);
    if (locked && natural) setWidth(Math.max(1, Math.round(natural.w * (v / natural.h))));
  }, [locked, natural]);

  const outputW = natural && mode === "percent"
    ? Math.max(1, Math.round(natural.w * scale / 100)) : Math.max(1, width);
  const outputH = natural && mode === "percent"
    ? Math.max(1, Math.round(natural.h * scale / 100)) : Math.max(1, height);

  const handleResize = useCallback(async () => {
    if (!file) return;
    setStatus("resizing");
    setError(null);
    try {
      const blob = await resizeImage(file, outputW, outputH);
      const ext = file.name.match(/\.[^.]+$/)?.[0] ?? ".png";
      downloadBlob(blob, `resized-${outputW}x${outputH}${ext}`);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resize failed");
      setStatus("error");
    }
  }, [file, outputW, outputH]);

  const handleReset = useCallback(() => {
    setFile(null);
    setNatural(null);
    setStatus("idle");
    setError(null);
  }, []);

  const isActive = status === "ready" || status === "done" || status === "resizing";

  return (
    <div className="space-y-6">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {status === "resizing" ? t("resizing") :
         status === "done" ? t("successTitle") :
         status === "error" ? error ?? "" : ""}
      </div>

      <FileDropzone accept={IMAGE_ACCEPT} multiple={false} onFiles={handleFiles}
        label={t("dropLabel")} sublabel={t("dropSublabel")} />

      {file && (
        <div className="rounded-lg border border-border px-4 py-3 flex items-center gap-3">
          <ImageIcon className="w-4 h-4 text-violet-500 shrink-0" />
          <span className="flex-1 text-sm font-medium truncate">{file.name}</span>
          {natural && <span className="text-xs text-muted-foreground shrink-0">{natural.w} × {natural.h}</span>}
          <button type="button" onClick={handleReset} aria-label={t("removeFile")}
            className="p-1 ml-1 text-muted-foreground hover:text-destructive transition-colors">
            <XIcon />
          </button>
        </div>
      )}

      {isActive && natural && (
        <div className="space-y-5">
          {/* Mode tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
            {(["pixels", "percent"] as Mode[]).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}>
                {t(m)}
              </button>
            ))}
          </div>

          {mode === "pixels" ? (
            <div className="flex items-end gap-3 flex-wrap">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="r-w">{t("width")}</label>
                <div className="flex items-center gap-1">
                  <input id="r-w" type="number" value={width} min={1}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-24 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <span className="text-xs text-muted-foreground">px</span>
                </div>
              </div>

              <button type="button" onClick={() => setLocked((v) => !v)}
                title={locked ? t("unlockAspect") : t("lockAspect")}
                aria-label={locked ? t("unlockAspect") : t("lockAspect")}
                className={`mb-0.5 p-1.5 rounded border transition-colors ${
                  locked ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:text-foreground"
                }`}>
                <LinkIcon locked={locked} />
              </button>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="r-h">{t("height")}</label>
                <div className="flex items-center gap-1">
                  <input id="r-h" type="number" value={height} min={1}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-24 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <span className="text-xs text-muted-foreground">px</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="r-scale">{t("scaleLabel")}</label>
              <div className="flex items-center gap-4">
                <input id="r-scale" type="range" min={1} max={200} value={scale}
                  onChange={(e) => setScale(Number(e.target.value))} className="w-40" />
                <div className="flex items-center gap-1">
                  <input type="number" value={scale} min={1} max={200}
                    onChange={(e) => setScale(Math.max(1, Math.min(200, Number(e.target.value))))}
                    className="w-16 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {t("newSize", { width: outputW, height: outputH })}
          </p>

          <div className="flex items-center gap-3">
            <Button size="xl" onClick={handleResize} disabled={status === "resizing"}>
              {status === "resizing" ? t("resizing") : t("resizeButton")}
            </Button>
            <button type="button" onClick={handleReset}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto">
              {t("clear")}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      )}

      {status === "done" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-700">{t("successTitle")}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5.09-5.09a2 2 0 0 0-2.82 0L6 17" /></svg>;
}
function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
function LinkIcon({ locked }: { locked: boolean }) {
  return locked
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="2" x2="8" y2="5" /><line x1="2" y1="8" x2="5" y2="8" /><line x1="16" y1="19" x2="16" y2="22" /><line x1="19" y1="16" x2="22" y2="16" /><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10 10 0 0 1 19 3a10 10 0 0 1 0 14l-1 1" /><path d="M6.26 6.26A10 10 0 0 0 5 8a10 10 0 0 0 14 9.74" /></svg>;
}
