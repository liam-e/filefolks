"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { convertCase, type CaseType } from "@/lib/processors/text";

const CASES: { key: CaseType; labelKey: string }[] = [
  { key: "camel",    labelKey: "camel" },
  { key: "pascal",   labelKey: "pascal" },
  { key: "snake",    labelKey: "snake" },
  { key: "kebab",    labelKey: "kebab" },
  { key: "screaming",labelKey: "screaming" },
  { key: "title",    labelKey: "title" },
  { key: "upper",    labelKey: "upper" },
  { key: "lower",    labelKey: "lower" },
];

export function CaseConverterTool() {
  const t = useTranslations("CaseConverter");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<CaseType | null>(null);

  const handleCopy = useCallback(async (key: CaseType, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  return (
    <div className="space-y-6">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("placeholder")}
        rows={4}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />

      {input.trim() && (
        <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {CASES.map(({ key, labelKey }) => {
            const value = convertCase(input, key);
            return (
              <li key={key} className="flex items-center justify-between gap-4 px-4 py-3 bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">{t(labelKey as Parameters<typeof t>[0])}</p>
                  <p className="text-sm font-mono truncate">{value}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(key, value)}
                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                >
                  {copied === key ? t("copied") : t("copy")}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!input.trim() && (
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/10 px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">{t("placeholder")}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
