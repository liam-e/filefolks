"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { compressImage, IMAGE_ACCEPT, type CompressImageResult } from "@/lib/processors/image";
import { downloadBlob, formatFileSize } from "@/lib/utils/file";

type Status = "idle" | "compressing" | "done" | "error";

export function ImageCompressorTool() {
  const t = useTranslations("ImageCompressor");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<CompressImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((incoming: File[]) => {
    const picked = incoming[0];
    if (!picked) return;
    setFile(picked);
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;
    setStatus("compressing");
    setError(null);
    try {
      const res = await compressImage(file);
      setResult(res);
      downloadBlob(res.blob, `compressed-${file.name}`);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed");
      setStatus("error");
    }
  }, [file]);

  const handleReset = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  const savings = result ? result.originalSize - result.compressedSize : 0;
  const savingsPct = result ? Math.round((savings / result.originalSize) * 100) : 0;

  return (
    <div className="space-y-6">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {status === "compressing" ? t("compressing") :
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
            <span className="text-xs text-muted-foreground shrink-0">{formatFileSize(file.size)}</span>
            <button
              type="button"
              onClick={handleReset}
              className="p-1 ml-1 text-muted-foreground hover:text-destructive transition-colors"
              aria-label={t("removeFile")}
            >
              <XIcon />
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button size="xl" onClick={handleCompress} disabled={status === "compressing"}>
              {status === "compressing" ? t("compressing") : t("compressButton")}
            </Button>
            {status === "done" && result && (
              <Button
                size="xl"
                variant="outline"
                onClick={() => downloadBlob(result.blob, `compressed-${file.name}`)}
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

      {status === "done" && result && (
        <div className={`rounded-lg border px-4 py-4 ${savings > 0 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          {savings > 0 ? (
            <>
              <p className="text-sm font-medium text-emerald-700 mb-3">{t("successTitle")}</p>
              <div className="flex flex-wrap gap-6 text-sm">
                <Stat label={t("original")} value={formatFileSize(result.originalSize)} color="emerald" />
                <Stat label={t("compressed")} value={formatFileSize(result.compressedSize)} color="emerald" />
                <Stat label={t("saved")} value={`${formatFileSize(savings)} (${savingsPct}%)`} color="emerald" />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-amber-700 mb-1">{t("alreadyOptimizedTitle")}</p>
              <p className="text-sm text-amber-700/80">
                {t("alreadyOptimizedBody", {
                  compressedSize: formatFileSize(result.compressedSize),
                  originalSize: formatFileSize(result.originalSize),
                })}
              </p>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: "emerald" }) {
  const cls = color === "emerald" ? { sub: "text-emerald-600/70", val: "text-emerald-800" } : { sub: "", val: "" };
  return (
    <div>
      <p className={`text-xs mb-0.5 ${cls.sub}`}>{label}</p>
      <p className={`font-medium ${cls.val}`}>{value}</p>
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
