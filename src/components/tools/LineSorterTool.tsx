"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { sortLines, type SortOrder } from "@/lib/processors/text";

const ORDERS: { key: SortOrder; labelKey: string }[] = [
  { key: "az",       labelKey: "orderAZ" },
  { key: "za",       labelKey: "orderZA" },
  { key: "shortest", labelKey: "orderShortest" },
  { key: "longest",  labelKey: "orderLongest" },
  { key: "random",   labelKey: "orderRandom" },
];

export function LineSorterTool() {
  const t = useTranslations("LineSorter");
  const [input, setInput] = useState("");
  const [order, setOrder] = useState<SortOrder>("az");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = input ? sortLines(input, order, caseSensitive) : "";

  const handleCopy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [result]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sorted.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-1 p-1 bg-muted rounded-lg flex-wrap">
          {ORDERS.map(({ key, labelKey }) => (
            <button
              key={key}
              type="button"
              onClick={() => setOrder(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${order === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t(labelKey as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="rounded" />
          <span className="text-sm">{t("caseSensitiveLabel")}</span>
        </label>
      </div>

      {/* Split editor */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("inputLabel")}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("inputPlaceholder")}
            rows={14}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("outputLabel")}</label>
          <textarea
            readOnly
            value={result}
            rows={14}
            className="w-full rounded-xl border border-input bg-muted/20 px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring font-mono"
          />
        </div>
      </div>

      {result && (
        <div className="flex gap-3">
          <button type="button" onClick={handleCopy} className="text-sm font-medium text-primary hover:underline">
            {copied ? t("copied") : t("copyButton")}
          </button>
          <span className="text-muted-foreground">·</span>
          <button type="button" onClick={handleDownload} className="text-sm font-medium text-primary hover:underline">
            {t("downloadButton")}
          </button>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
