"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { decodeJwt } from "@/lib/processors/text";

export function JwtDecoderTool() {
  const t = useTranslations("JwtDecoder");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof decodeJwt> | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleDecode = useCallback(() => {
    setResult(decodeJwt(input));
  }, [input]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setResult(null);
  }, []);

  const formatDate = (ts: unknown): string => {
    if (typeof ts !== "number") return String(ts);
    return new Date(ts * 1000).toLocaleString();
  };

  const isExpired = (payload: Record<string, unknown>): boolean | null => {
    if (typeof payload.exp !== "number") return null;
    return Date.now() / 1000 > payload.exp;
  };

  const prettyJson = (obj: Record<string, unknown>) =>
    JSON.stringify(obj, null, 2);

  return (
    <div className="space-y-6">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {result?.error ?? ""}
      </div>

      {/* Input */}
      <div className="space-y-2">
        <span className="text-sm font-medium">{t("inputLabel")}</span>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setResult(null); }}
          placeholder={t("inputPlaceholder")}
          spellCheck={false}
          rows={4}
          className="w-full rounded-lg border border-input bg-background px-4 py-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex gap-3">
        <Button size="xl" onClick={handleDecode} disabled={!input.trim()}>
          {t("decodeButton")}
        </Button>
        {result && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("clear")}
          </button>
        )}
      </div>

      {result?.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
          <p className="text-sm text-destructive/80 mt-1">{result.error}</p>
        </div>
      )}

      {result?.valid && (
        <div className="space-y-4">
          {/* Expiry badge */}
          {typeof result.payload.exp === "number" && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                isExpired(result.payload)
                  ? "bg-destructive/10 text-destructive"
                  : "bg-green-500/10 text-green-700 dark:text-green-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isExpired(result.payload) ? "bg-destructive" : "bg-green-500"}`} />
                {isExpired(result.payload) ? t("expired") : t("valid")}
              </div>
              <span className="text-sm text-muted-foreground">
                {t("expiresLabel")}: {formatDate(result.payload.exp)}
              </span>
              {typeof result.payload.iat === "number" && (
                <span className="text-sm text-muted-foreground">
                  {t("issuedAtLabel")}: {formatDate(result.payload.iat)}
                </span>
              )}
            </div>
          )}

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("header")}</span>
              <button
                type="button"
                onClick={() => handleCopy(prettyJson(result.header), "header")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied === "header" ? t("copied") : t("copy")}
              </button>
            </div>
            <pre className="w-full rounded-lg border border-input bg-muted/30 px-4 py-3 font-mono text-sm overflow-x-auto">
              {prettyJson(result.header)}
            </pre>
          </div>

          {/* Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("payload")}</span>
              <button
                type="button"
                onClick={() => handleCopy(prettyJson(result.payload), "payload")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied === "payload" ? t("copied") : t("copy")}
              </button>
            </div>
            <pre className="w-full rounded-lg border border-input bg-muted/30 px-4 py-3 font-mono text-sm overflow-x-auto">
              {prettyJson(result.payload)}
            </pre>
          </div>

          {/* Signature note */}
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">{t("signature")}</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono truncate">{result.signaturePart}</p>
            <p className="text-xs text-muted-foreground mt-2">{t("signatureNote")}</p>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
