"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { generateUuids } from "@/lib/processors/text";

export function UuidGeneratorTool() {
  const t = useTranslations("UuidGenerator");
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleGenerate = useCallback(() => {
    setUuids(generateUuids(count));
    setCopiedIndex(null);
    setCopiedAll(false);
  }, [count]);

  const handleCopy = useCallback(async (uuid: string, index: number) => {
    await navigator.clipboard.writeText(uuid);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const handleCopyAll = useCallback(async () => {
    await navigator.clipboard.writeText(uuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }, [uuids]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uuids.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [uuids]);

  const handleClear = useCallback(() => {
    setUuids([]);
    setCopiedIndex(null);
    setCopiedAll(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-end gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="uuid-count">
            {t("countLabel")}
          </label>
          <input
            id="uuid-count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button size="xl" onClick={handleGenerate}>
          {t("generateButton")}
        </Button>
      </div>

      {uuids.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{uuids.length} UUID{uuids.length !== 1 ? "s" : ""}</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCopyAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedAll ? t("copiedAll") : t("copyAll")}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("download")}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("clear")}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border divide-y divide-border">
            {uuids.map((uuid, i) => (
              <div key={uuid} className="flex items-center justify-between px-4 py-2.5 group">
                <span className="font-mono text-sm select-all">{uuid}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(uuid, i)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ml-4 shrink-0"
                >
                  {copiedIndex === i ? t("copied") : t("copy")}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {uuids.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("placeholder")}</p>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
