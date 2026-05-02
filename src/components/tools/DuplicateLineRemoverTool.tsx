"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { removeDuplicateLines } from "@/lib/processors/text";

export function DuplicateLineRemoverTool() {
  const t = useTranslations("DuplicateLineRemover");
  const [input, setInput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [copied, setCopied] = useState(false);

  const { result, removed } = removeDuplicateLines(input, { caseSensitive, trimLines, removeEmpty });

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
    a.download = "deduplicated.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="flex flex-wrap gap-4">
        {[
          { checked: caseSensitive, setter: setCaseSensitive, labelKey: "caseSensitiveLabel" },
          { checked: trimLines,     setter: setTrimLines,     labelKey: "trimLinesLabel" },
          { checked: removeEmpty,   setter: setRemoveEmpty,   labelKey: "removeEmptyLabel" },
        ].map(({ checked, setter, labelKey }) => (
          <label key={labelKey} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => setter(e.target.checked)} className="rounded" />
            <span className="text-sm">{t(labelKey as Parameters<typeof t>[0])}</span>
          </label>
        ))}
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("outputLabel")}</label>
            {removed > 0 && (
              <span className="text-xs text-muted-foreground">
                {removed === 1 ? t("linesRemoved", { count: 1 }) : t("linesRemovedPlural", { count: removed })}
              </span>
            )}
          </div>
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
