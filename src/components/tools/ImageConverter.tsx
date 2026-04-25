"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/shared/FileDropzone";
import {
  convertImage,
  IMAGE_ACCEPT,
  FORMAT_EXT,
  FORMAT_LABEL,
  type ImageFormat,
} from "@/lib/processors/image";
import { downloadBlob } from "@/lib/utils/file";

type Status = "idle" | "converting" | "done" | "error";

const FORMATS: ImageFormat[] = ["image/png", "image/jpeg", "image/webp"];

function stripExt(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

export function ImageConverterTool() {
  const t = useTranslations("ImageConverter");
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("image/jpeg");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [outputName, setOutputName] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);

  const handleFiles = useCallback((incoming: File[]) => {
    const picked = incoming[0];
    if (!picked) return;
    setFile(picked);
    setStatus("idle");
    setError(null);
    setOutputBlob(null);
    // Auto-suggest a different format than the input
    const inputType = picked.type as ImageFormat;
    const next = FORMATS.find((f) => f !== inputType) ?? "image/jpeg";
    setTargetFormat(next);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setStatus("converting");
    setError(null);
    try {
      const blob = await convertImage(file, targetFormat);
      const name = `${stripExt(file.name)}.${FORMAT_EXT[targetFormat]}`;
      setOutputBlob(blob);
      setOutputName(name);
      downloadBlob(blob, name);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setStatus("error");
    }
  }, [file, targetFormat]);

  const handleReset = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setError(null);
    setOutputBlob(null);
    setOutputName(null);
  }, []);

  return (
    <div className="space-y-6">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {status === "converting" ? t("converting") :
         status === "done" ? t("successTitle") :
         status === "error" ? error ?? "" : ""}
      </div>

      <FileDropzone
        accept={IMAGE_ACCEPT}
        multiple={false}
        onFiles={handleFiles}
        label={t("dropLabel")}
        sublabel={t("dropSublabel")}
      />

      {file && (
        <>
          <div className="rounded-lg border border-border px-4 py-3 flex items-center gap-3">
            <ImageIcon className="w-4 h-4 text-violet-500 shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground truncate">{file.name}</span>
            <button
              type="button"
              onClick={handleReset}
              className="p-1 ml-1 text-muted-foreground hover:text-destructive transition-colors"
              aria-label={t("removeFile")}
            >
              <XIcon />
            </button>
          </div>

          {/* Format selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("convertTo")}</p>
            <div className="flex gap-2 flex-wrap">
              {FORMATS.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setTargetFormat(fmt)}
                  disabled={fmt === (file.type as ImageFormat)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    targetFormat === fmt
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary"
                  }`}
                >
                  {FORMAT_LABEL[fmt]}
                </button>
              ))}
            </div>
            {targetFormat === "image/jpeg" && (
              <p className="text-xs text-muted-foreground">{t("jpegNote")}</p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button size="xl" onClick={handleConvert} disabled={status === "converting"}>
              {status === "converting" ? t("converting") : t("convertButton")}
            </Button>
            {status === "done" && outputBlob && outputName && (
              <Button
                size="xl"
                variant="outline"
                onClick={() => downloadBlob(outputBlob, outputName)}
              >
                {t("downloadAgain")}
              </Button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
            >
              {t("clear")}
            </button>
          </div>
        </>
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
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5.09-5.09a2 2 0 0 0-2.82 0L6 17" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
