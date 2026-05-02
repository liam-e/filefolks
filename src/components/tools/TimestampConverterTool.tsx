"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { convertTimestamp, dateToTimestamp, currentUnixTimestamp } from "@/lib/processors/text";

export function TimestampConverterTool() {
  const t = useTranslations("TimestampConverter");
  const [now, setNow] = useState(currentUnixTimestamp());
  const [tsInput, setTsInput] = useState("");
  const [tsResult, setTsResult] = useState<ReturnType<typeof convertTimestamp> | null>(null);
  const [tsError, setTsError] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [dateResult, setDateResult] = useState<number | null>(null);
  const [dateError, setDateError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(currentUnixTimestamp()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleConvertTs = useCallback(() => {
    try {
      setTsResult(convertTimestamp(tsInput));
      setTsError("");
    } catch {
      setTsError(t("errorInvalid"));
      setTsResult(null);
    }
  }, [tsInput, t]);

  const handleConvertDate = useCallback(() => {
    try {
      setDateResult(dateToTimestamp(dateInput));
      setDateError("");
    } catch {
      setDateError(t("errorInvalid"));
      setDateResult(null);
    }
  }, [dateInput, t]);

  const Row = ({ label, value, copyKey }: { label: string; value: string; copyKey: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm">{value}</span>
        <button type="button" onClick={() => handleCopy(value, copyKey)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied === copyKey ? t("copied") : t("copy")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Live timestamp */}
      <div className="rounded-lg border border-border p-4 flex items-center justify-between">
        <span className="text-sm font-medium">{t("currentLabel")}</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg tabular-nums">{now}</span>
          <button type="button" onClick={() => handleCopy(String(now), "now")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            {copied === "now" ? t("copied") : t("copy")}
          </button>
        </div>
      </div>

      {/* Unix → Date */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">{t("unixToDateLabel")}</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConvertTs()}
            placeholder={t("unixPlaceholder")}
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={handleConvertTs}>{t("convert")}</Button>
        </div>
        {tsError && <p className="text-sm text-destructive">{tsError}</p>}
        {tsResult && (
          <div className="rounded-lg border border-border px-4 divide-y divide-border">
            <Row label={t("iso")} value={tsResult.iso} copyKey="iso" />
            <Row label={t("utc")} value={tsResult.utc} copyKey="utc" />
            <Row label={t("local")} value={tsResult.local} copyKey="local" />
            <Row label={t("unixSeconds")} value={String(tsResult.unix)} copyKey="unix" />
            <Row label={t("unixMs")} value={String(tsResult.unixMs)} copyKey="unixMs" />
          </div>
        )}
      </div>

      {/* Date → Unix */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">{t("dateToUnixLabel")}</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConvertDate()}
            placeholder={t("datePlaceholder")}
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={handleConvertDate}>{t("convert")}</Button>
        </div>
        {dateError && <p className="text-sm text-destructive">{dateError}</p>}
        {dateResult !== null && (
          <div className="rounded-lg border border-border px-4 divide-y divide-border">
            <Row label={t("unixSeconds")} value={String(dateResult)} copyKey="dateUnix" />
            <Row label={t("unixMs")} value={String(dateResult * 1000)} copyKey="dateUnixMs" />
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
