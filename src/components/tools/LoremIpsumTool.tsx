"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { generateLorem, type LoremUnit } from "@/lib/processors/text";

const UNITS: { key: LoremUnit; labelKey: string }[] = [
  { key: "paragraphs", labelKey: "unitParagraphs" },
  { key: "sentences",  labelKey: "unitSentences" },
  { key: "words",      labelKey: "unitWords" },
];

export function LoremIpsumTool() {
  const t = useTranslations("LoremIpsum");
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<LoremUnit>("paragraphs");
  const [classicStart, setClassicStart] = useState(true);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    setOutput(generateLorem(Math.max(1, count), unit, classicStart));
    setCopied(false);
  }, [count, unit, classicStart]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("countLabel")}</label>
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
            className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("unitLabel")}</label>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {UNITS.map(({ key, labelKey }) => (
              <button
                key={key}
                type="button"
                onClick={() => setUnit(key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${unit === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t(labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={classicStart}
          onChange={(e) => setClassicStart(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm">{t("classicStartLabel")}</span>
      </label>

      <Button size="xl" onClick={handleGenerate}>
        {output ? t("regenerateButton") : t("generateButton")}
      </Button>

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("outputLabel")}</span>
            <button type="button" onClick={handleCopy} className="text-xs font-medium text-primary hover:underline">
              {copied ? t("copied") : t("copyButton")}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            rows={10}
            className="w-full rounded-xl border border-input bg-muted/20 px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
