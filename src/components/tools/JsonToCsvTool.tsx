"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { jsonToCsv } from "@/lib/processors/text";

export function JsonToCsvTool() {
  const t = useTranslations("JsonToCsv");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof jsonToCsv> | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    setResult(jsonToCsv(input));
    setCopied(false);
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!result?.csv) return;
    await navigator.clipboard.writeText(result.csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleDownload = useCallback(() => {
    if (!result?.csv) return;
    const blob = new Blob([result.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="json-input">{t("inputLabel")}</label>
        <textarea
          id="json-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("inputPlaceholder")}
          rows={8}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </div>

      <Button size="xl" onClick={handleConvert} disabled={!input.trim()}>
        {t("convertButton")}
      </Button>

      {result && (
        <div className="space-y-3">
          {result.error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
              <p className="text-sm text-destructive/80 mt-1">{result.error}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("rowCount", { count: result.rowCount })} &middot; {t("columnCount", { count: result.headers.length })}
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={handleCopy} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {copied ? t("copied") : t("copyButton")}
                  </button>
                  <button type="button" onClick={handleDownload} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {t("downloadButton")}
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={result.csv}
                rows={8}
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-mono resize-y"
              />
            </>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
