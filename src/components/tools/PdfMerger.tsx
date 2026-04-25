"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { mergePdfs } from "@/lib/processors/pdf";
import { downloadBlob, formatFileSize } from "@/lib/utils/file";

type Status = "idle" | "merging" | "done" | "error";

export function PdfMergerTool() {
  const t = useTranslations("PdfMerger");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => [...prev, ...incoming]);
    setStatus("idle");
    setError(null);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setStatus("idle");
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setFiles((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) return;
    setStatus("merging");
    setError(null);
    try {
      const blob = await mergePdfs(files);
      downloadBlob(blob, "merged.pdf");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Merge failed");
      setStatus("error");
    }
  }, [files]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setStatus("idle");
    setError(null);
  }, []);

  const mergeLabel =
    status === "merging"
      ? t("merging")
      : files.length === 1
        ? t("mergeButton", { count: 1 })
        : t("mergeButtonPlural", { count: files.length });

  return (
    <div className="space-y-6">
      {/* Announces processing state to screen readers */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {status === "merging" ? t("merging") :
         status === "done" ? t("success") :
         status === "error" ? error ?? "" : ""}
      </div>

      <FileDropzone
        accept={{ "application/pdf": [".pdf"] }}
        multiple
        onFiles={handleFiles}
        label={t("dropLabel")}
        sublabel={t("dropSublabel")}
      />

      {files.length > 0 && (
        <>
          <div className="rounded-lg border border-border divide-y divide-border">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="w-5 text-xs text-muted-foreground text-right shrink-0 select-none">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatFileSize(file.size)}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-25 transition-colors"
                    aria-label={t("moveUp")}
                  >
                    <ChevronUpIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === files.length - 1}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-25 transition-colors"
                    aria-label={t("moveDown")}
                  >
                    <ChevronDownIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1 ml-1 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={t("removeFile")}
                  >
                    <XIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              size="xl"
              onClick={handleMerge}
              disabled={files.length < 2 || status === "merging"}
            >
              {mergeLabel}
            </Button>
            {status === "done" && (
              <Button size="xl" variant="outline" onClick={handleMerge}>
                {t("downloadAgain")}
              </Button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
            >
              {t("clearAll")}
            </button>
          </div>

          {files.length < 2 && (
            <p className="text-sm text-muted-foreground">{t("addMoreFiles")}</p>
          )}
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
          <p className="text-sm font-medium text-emerald-700">{t("success")}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">
        {t("privacyNote")}
      </p>
    </div>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
