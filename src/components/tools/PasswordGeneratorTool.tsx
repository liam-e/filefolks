"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { generatePassword, passwordStrength } from "@/lib/processors/text";

export function PasswordGeneratorTool() {
  const t = useTranslations("PasswordGenerator");
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    setPassword(generatePassword({ length, uppercase, lowercase, digits, symbols }));
    setCopied(false);
  }, [length, uppercase, lowercase, digits, symbols]);

  const handleCopy = useCallback(async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  const strength = password ? passwordStrength(password) : null;
  const strengthColors: Record<string, string> = {
    "weak": "bg-red-500",
    "fair": "bg-yellow-500",
    "strong": "bg-blue-500",
    "very-strong": "bg-green-500",
  };
  const strengthWidth: Record<string, string> = {
    "weak": "w-1/4",
    "fair": "w-2/4",
    "strong": "w-3/4",
    "very-strong": "w-full",
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="pw-length">
            {t("lengthLabel")}: {length}
          </label>
          <input
            id="pw-length"
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t("includeLabel")}</p>
          {([ ["uppercase", uppercase, setUppercase], ["lowercase", lowercase, setLowercase], ["digits", digits, setDigits], ["symbols", symbols, setSymbols]] as [string, boolean, (v: boolean) => void][]).map(([key, val, setter]) => (
            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={val} onChange={(e) => setter(e.target.checked)} className="accent-primary" />
              {t(key as Parameters<typeof t>[0])}
            </label>
          ))}
        </div>
      </div>

      <Button size="xl" onClick={handleGenerate}>{t("generateButton")}</Button>

      {password && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <span className="font-mono text-base flex-1 break-all select-all">{password}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              {copied ? t("copied") : t("copyButton")}
            </button>
          </div>

          {strength && (
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strengthColors[strength]} ${strengthWidth[strength]}`} />
              </div>
              <p className="text-xs text-muted-foreground">{t(`strength${strength.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join("")}` as Parameters<typeof t>[0])}</p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
