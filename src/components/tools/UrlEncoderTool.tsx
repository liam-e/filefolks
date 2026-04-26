"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { encodeUrl, decodeUrl } from "@/lib/processors/text";

type Mode = "encode" | "decode";

export function UrlEncoderTool() {
  const t = useTranslations("UrlEncoder");
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  const handleModeSwitch = useCallback((next: Mode) => {
    setMode(next);
    reset();
  }, [reset]);

  const handleRun = useCallback(() => {
    setError(null);
    try {
      setOutput(mode === "encode" ? encodeUrl(input) : decodeUrl(input));
    } catch {
      setError(t("invalidEncoding"));
      setOutput("");
    }
  }, [mode, input, t]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="space-y-6">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {error ?? ""}
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(["encode", "decode"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleModeSwitch(m)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === m
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(m)}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="space-y-2">
        <span className="text-sm font-medium">{t("inputLabel")}</span>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setOutput(""); setError(null); }}
          placeholder={mode === "encode" ? t("encodePlaceholder") : t("decodePlaceholder")}
          spellCheck={false}
          rows={6}
          className="w-full rounded-lg border border-input bg-background px-4 py-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Button
        size="xl"
        onClick={handleRun}
        disabled={!input.trim()}
      >
        {mode === "encode" ? t("encodeButton") : t("decodeButton")}
      </Button>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      )}

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("outputLabel")}</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? t("copied") : t("copy")}
              </button>
              <button
                type="button"
                onClick={reset}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("clear")}
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            spellCheck={false}
            rows={6}
            className="w-full rounded-lg border border-input bg-muted/30 px-4 py-3 font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
