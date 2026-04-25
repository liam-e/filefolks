"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { getPdfPageCount, splitPdf } from "@/lib/processors/pdf";
import { downloadBlob, formatFileSize } from "@/lib/utils/file";

type Status = "idle" | "loading" | "ready" | "splitting" | "done" | "error";

export function PdfSplitterTool() {
  const t = useTranslations("PdfSplitter");
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
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
      setFromPage(1);
      setToPage(count);
      setStatus("ready");
    } catch {
      setError("Could not read PDF. The file may be corrupted or password-protected.");
      setStatus("error");
    }
  }, []);

  const handleSplit = useCallback(async () => {
    if (!file) return;
    setStatus("splitting");
    setError(null);
    try {
      const blob = await splitPdf(file, fromPage, toPage);
      setResultBlob(blob);
      downloadBlob(blob, `pages-${fromPage}-${toPage}-${file.name}`);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Split failed");
      setStatus("error");
    }
  }, [file, fromPage, toPage]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPageCount(0);
    setFromPage(1);
    setToPage(1);
    setStatus("idle");
    setError(null);
    setResultBlob(null);
  }, []);

  const clampFrom = useCallback((v: number) => {
    const clamped = Math.max(1, Math.min(v, toPage));
    setFromPage(clamped);
  }, [toPage]);

  const clampTo = useCallback((v: number) => {
    const clamped = Math.max(fromPage, Math.min(v, pageCount));
    setToPage(clamped);
  }, [fromPage, pageCount]);

  const extractCount = toPage - fromPage + 1;

  return (
    <div className="space-y-6">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {status === "loading" ? t("loadingPages") :
         status === "splitting" ? t("extracting") :
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
          <button
            type="button"
            onClick={handleReset}
            className="p-1 ml-1 text-muted-foreground hover:text-destructive transition-colors"
            aria-label={t("removeFile")}
          >
            <XIcon />
          </button>
        </div>
      )}

      {status === "ready" || status === "done" || status === "splitting" ? (
        <div className="space-y-4">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="from-page">
                {t("fromPage")}
              </label>
              <input
                id="from-page"
                type="number"
                value={fromPage}
                min={1}
                max={toPage}
                onChange={(e) => clampFrom(Number(e.target.value))}
                className="w-24 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="to-page">
                {t("toPage")}
              </label>
              <input
                id="to-page"
                type="number"
                value={toPage}
                min={fromPage}
                max={pageCount}
                onChange={(e) => clampTo(Number(e.target.value))}
                className="w-24 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <p className="text-sm text-muted-foreground pb-1">
              {t("extractCount", { count: extractCount })}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button size="xl" onClick={handleSplit} disabled={status === "splitting"}>
              {status === "splitting" ? t("extracting") : t("extractButton")}
            </Button>
            {status === "done" && resultBlob && file && (
              <Button
                size="xl"
                variant="outline"
                onClick={() => downloadBlob(resultBlob, `pages-${fromPage}-${toPage}-${file.name}`)}
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
        </div>
      ) : null}

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

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
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
