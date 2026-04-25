"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { getPdfPageCount, rotatePdf } from "@/lib/processors/pdf";
import { downloadBlob, formatFileSize } from "@/lib/utils/file";

type Status = "idle" | "loading" | "ready" | "rotating" | "done" | "error";
type Rotation = 90 | 180 | 270;

const ROTATIONS: { value: Rotation; labelKey: "rotateLeft" | "rotate180" | "rotateRight" }[] = [
  { value: 270, labelKey: "rotateLeft" },
  { value: 180, labelKey: "rotate180" },
  { value: 90,  labelKey: "rotateRight" },
];

export function PdfRotatorTool() {
  const t = useTranslations("PdfRotator");
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState<Rotation>(90);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFiles = useCallback(async (incoming: File[]) => {
    const picked = incoming[0];
    if (!picked) return;
    setFile(picked);
    setStatus("loading");
    setError(null);
    setResultBlob(null);
    try {
      const count = await getPdfPageCount(picked);
      setPageCount(count);
      setStatus("ready");
    } catch {
      setError("Could not read PDF. The file may be corrupted or password-protected.");
      setStatus("error");
    }
  }, []);

  const handleRotate = useCallback(async () => {
    if (!file) return;
    setStatus("rotating");
    setError(null);
    try {
      const blob = await rotatePdf(file, rotation);
      setResultBlob(blob);
      downloadBlob(blob, `rotated-${file.name}`);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rotation failed");
      setStatus("error");
    }
  }, [file, rotation]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPageCount(0);
    setStatus("idle");
    setError(null);
    setResultBlob(null);
  }, []);

  return (
    <div className="space-y-6">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {status === "loading" ? t("loadingPages") :
         status === "rotating" ? t("rotating") :
         status === "done" ? t("successTitle") :
         status === "error" ? error ?? "" : ""}
      </div>

      <FileDropzone
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        onFiles={handleFiles}
        label={t("dropLabel")}
        sublabel={t("dropSublabel")}
      />

      {file && (
        <div className="rounded-lg border border-border px-4 py-3 flex items-center gap-3">
          <PdfIcon className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="flex-1 text-sm font-medium text-foreground truncate">{file.name}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {status === "loading" ? t("loadingPages") :
             pageCount > 0 ? t("pageCount", { count: pageCount }) :
             formatFileSize(file.size)}
          </span>
          <button type="button" onClick={handleReset}
            className="p-1 ml-1 text-muted-foreground hover:text-destructive transition-colors"
            aria-label={t("removeFile")}>
            <XIcon />
          </button>
        </div>
      )}

      {(status === "ready" || status === "done" || status === "rotating") && (
        <div className="space-y-4">
          {/* Rotation selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("rotationLabel")}</p>
            <div className="flex gap-2">
              {ROTATIONS.map(({ value, labelKey }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRotation(value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    rotation === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary"
                  }`}
                >
                  <RotationIcon value={value} />
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button size="xl" onClick={handleRotate} disabled={status === "rotating"}>
              {status === "rotating" ? t("rotating") : t("rotateButton")}
            </Button>
            {status === "done" && resultBlob && file && (
              <Button size="xl" variant="outline"
                onClick={() => downloadBlob(resultBlob, `rotated-${file.name}`)}>
                {t("downloadAgain")}
              </Button>
            )}
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

function RotationIcon({ value }: { value: Rotation }) {
  if (value === 180) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <polyline points="23 20 23 14 17 14" />
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
      </svg>
    );
  }
  if (value === 270) {
    // rotate left (CCW)
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    );
  }
  // rotate right (CW)
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
