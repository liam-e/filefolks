"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { countText } from "@/lib/processors/text";

export function WordCounterTool() {
  const t = useTranslations("WordCounter");
  const [text, setText] = useState("");
  const stats = countText(text);
  const hasText = text.trim().length > 0;

  const statRows = [
    { label: t("words"),         value: stats.words.toLocaleString() },
    { label: t("characters"),    value: stats.chars.toLocaleString() },
    { label: t("charsNoSpaces"), value: stats.charsNoSpaces.toLocaleString() },
    { label: t("sentences"),     value: stats.sentences.toLocaleString() },
    { label: t("paragraphs"),    value: stats.paragraphs.toLocaleString() },
    { label: t("readingTime"),   value: hasText ? t("readingTimeValue", { min: stats.readingTimeMin }) : "—" },
  ];

  return (
    <div className="space-y-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("placeholder")}
        rows={10}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statRows.map((row) => (
          <div key={row.label} className="rounded-xl border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs text-muted-foreground">{row.label}</p>
            <p className="text-2xl font-semibold mt-0.5 tabular-nums">{hasText ? row.value : "—"}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
