"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { cropImage, getImageDimensions, IMAGE_ACCEPT } from "@/lib/processors/image";
import { downloadBlob } from "@/lib/utils/file";

type Status = "idle" | "loading" | "ready" | "cropping" | "done" | "error";

interface Crop { x: number; y: number; width: number; height: number }

const PRESETS = [
  { key: "free", label: "Free", ratio: null },
  { key: "1:1", label: "1:1", ratio: 1 },
  { key: "4:3", label: "4:3", ratio: 4 / 3 },
  { key: "16:9", label: "16:9", ratio: 16 / 9 },
  { key: "3:2", label: "3:2", ratio: 3 / 2 },
] as const;

export function ImageCropTool() {
  const t = useTranslations("ImageCrop");
  const [file, setFile] = useState<File | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 0, height: 0 });
  const [activePreset, setActivePreset] = useState<string>("free");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // Revoke object URL when file changes
  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFiles = useCallback(async (incoming: File[]) => {
    const picked = incoming[0];
    if (!picked) return;
    setFile(picked);
    setStatus("loading");
    setError(null);
    try {
      const { width: w, height: h } = await getImageDimensions(picked);
      setNatural({ w, h });
      setCrop({ x: 0, y: 0, width: w, height: h });
      setActivePreset("free");
      setStatus("ready");
    } catch {
      setError("Could not read image.");
      setStatus("error");
    }
  }, []);

  const applyPreset = useCallback((ratio: number | null) => {
    if (!natural) return;
    if (ratio === null) return; // free — don't change crop
    const imageRatio = natural.w / natural.h;
    if (ratio > imageRatio) {
      const h = Math.round(natural.w / ratio);
      setCrop({ x: 0, y: Math.round((natural.h - h) / 2), width: natural.w, height: h });
    } else {
      const w = Math.round(natural.h * ratio);
      setCrop({ x: Math.round((natural.w - w) / 2), y: 0, width: w, height: natural.h });
    }
  }, [natural]);

  const handlePreset = useCallback((preset: typeof PRESETS[number]) => {
    setActivePreset(preset.key);
    if (preset.ratio !== null) applyPreset(preset.ratio);
  }, [applyPreset]);

  const clampedCrop = natural ? {
    x: Math.max(0, Math.min(crop.x, natural.w - 1)),
    y: Math.max(0, Math.min(crop.y, natural.h - 1)),
    width: Math.max(1, Math.min(crop.width, natural.w - crop.x)),
    height: Math.max(1, Math.min(crop.height, natural.h - crop.y)),
  } : crop;

  const handleCrop = useCallback(async () => {
    if (!file) return;
    setStatus("cropping");
    setError(null);
    try {
      const blob = await cropImage(file, clampedCrop.x, clampedCrop.y, clampedCrop.width, clampedCrop.height);
      const ext = file.name.match(/\.[^.]+$/)?.[0] ?? ".png";
      downloadBlob(blob, `cropped-${clampedCrop.width}x${clampedCrop.height}${ext}`);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Crop failed");
      setStatus("error");
    }
  }, [file, clampedCrop]);

  const handleReset = useCallback(() => {
    setFile(null);
    setNatural(null);
    setStatus("idle");
    setError(null);
    setActivePreset("free");
  }, []);

  const isActive = status === "ready" || status === "done" || status === "cropping";

  return (
    <div className="space-y-6">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {status === "cropping" ? t("cropping") :
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

      {isActive && natural && previewUrl && (
        <div className="space-y-4">
          {/* Visual preview */}
          <div
            className="relative overflow-hidden rounded-lg border border-border bg-muted/20 w-full"
            style={{ paddingBottom: `min(${(natural.h / natural.w) * 100}%, 320px)` }}
          >
            {/* Base image */}
            <img src={previewUrl} className="absolute inset-0 w-full h-full" style={{ objectFit: "fill" }} alt="" />
            {/* Darkened areas outside crop */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top */}
              <div className="absolute inset-x-0 top-0 bg-black/50"
                style={{ height: `${(clampedCrop.y / natural.h) * 100}%` }} />
              {/* Bottom */}
              <div className="absolute inset-x-0 bottom-0 bg-black/50"
                style={{ height: `${((natural.h - clampedCrop.y - clampedCrop.height) / natural.h) * 100}%` }} />
              {/* Left */}
              <div className="absolute bg-black/50"
                style={{ left: 0, top: `${(clampedCrop.y / natural.h) * 100}%`, width: `${(clampedCrop.x / natural.w) * 100}%`, height: `${(clampedCrop.height / natural.h) * 100}%` }} />
              {/* Right */}
              <div className="absolute bg-black/50"
                style={{ right: 0, top: `${(clampedCrop.y / natural.h) * 100}%`, width: `${((natural.w - clampedCrop.x - clampedCrop.width) / natural.w) * 100}%`, height: `${(clampedCrop.height / natural.h) * 100}%` }} />
              {/* Crop border */}
              <div className="absolute ring-2 ring-white/90"
                style={{ left: `${(clampedCrop.x / natural.w) * 100}%`, top: `${(clampedCrop.y / natural.h) * 100}%`, width: `${(clampedCrop.width / natural.w) * 100}%`, height: `${(clampedCrop.height / natural.h) * 100}%` }} />
            </div>
          </div>

          {/* Preset buttons */}
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map((preset) => (
              <button key={preset.key} type="button" onClick={() => handlePreset(preset)}
                className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                  activePreset === preset.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary"
                }`}>
                {preset.label}
              </button>
            ))}
          </div>

          {/* Coordinate inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["x", "y", "width", "height"] as const).map((field) => (
              <div key={field} className="space-y-1">
                <label className="text-sm font-medium capitalize" htmlFor={`crop-${field}`}>
                  {t(field)}
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id={`crop-${field}`}
                    type="number"
                    value={crop[field]}
                    min={field === "width" || field === "height" ? 1 : 0}
                    max={field === "x" ? natural.w - 1 : field === "y" ? natural.h - 1 : field === "width" ? natural.w : natural.h}
                    onChange={(e) => {
                      setActivePreset("free");
                      setCrop((prev) => ({ ...prev, [field]: Math.max(0, Number(e.target.value)) }));
                    }}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-xs text-muted-foreground shrink-0">px</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            {t("outputSize", { width: clampedCrop.width, height: clampedCrop.height })}
          </p>

          <div className="flex items-center gap-3">
            <Button size="xl" onClick={handleCrop} disabled={status === "cropping"}>
              {status === "cropping" ? t("cropping") : t("cropButton")}
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
