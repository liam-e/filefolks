"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { encodeBase64, decodeBase64, encodeFileToBase64 } from "@/lib/processors/text";

type Mode = "encode" | "decode";
type InputMode = "text" | "file";

export function Base64Tool() {
  const t = useTranslations("Base64");
  const [mode, setMode] = useState<Mode>("encode");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setInput("");
    setFileName(null);
    setOutput("");
    setError(null);
  }, []);

  const handleModeSwitch = useCallback((next: Mode) => {
    setMode(next);
    setInputMode("text");
    reset();
  }, [reset]);

  const handleRun = useCallback(() => {
    setError(null);
    try {
      if (mode === "encode") {
        setOutput(encodeBase64(input));
      } else {
        setOutput(decodeBase64(input));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("invalidBase64"));
      setOutput("");
    }
  }, [mode, input, t]);

  const handleFileLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const buf = ev.target?.result;
      if (buf instanceof ArrayBuffer) {
        const b64 = encodeFileToBase64(buf);
        setOutput(b64);
        setInput("");
        setError(null);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }, []);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const isBusy = false;

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
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("inputLabel")}</span>
          {mode === "encode" && (
            <div className="flex gap-3 items-center">
              <button
                type="button"
                onClick={() => { setInputMode("text"); reset(); }}
                className={`text-xs transition-colors ${inputMode === "text" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t("textMode")}
              </button>
              <button
                type="button"
                onClick={() => { setInputMode("file"); reset(); fileInputRef.current?.click(); }}
                className={`text-xs transition-colors ${inputMode === "file" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t("fileMode")}
              </button>
              <input ref={fileInputRef} type="file" className="sr-only" onChange={handleFileLoad} />
            </div>
          )}
        </div>

        {inputMode === "file" && mode === "encode" ? (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-center gap-3">
            {fileName ? (
              <>
                <span className="text-sm text-foreground flex-1 truncate">{fileName}</span>
                <button
                  type="button"
                  onClick={() => { fileInputRef.current?.click(); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("loadFile")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("loadFile")}
              </button>
            )}
          </div>
        ) : (
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setOutput(""); setError(null); }}
            placeholder={mode === "encode" ? t("encodePlaceholder") : t("decodePlaceholder")}
            spellCheck={false}
            rows={6}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}
      </div>

      {/* Action button */}
      {(inputMode === "text" || mode === "decode") && (
        <Button
          size="xl"
          onClick={handleRun}
          disabled={isBusy || (!input.trim() && inputMode === "text")}
        >
          {mode === "encode" ? t("encodeButton") : t("decodeButton")}
        </Button>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      )}

      {/* Output */}
      {(output || (inputMode === "file" && fileName)) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("outputLabel")}</span>
            <div className="flex gap-3">
              {output && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? t("copied") : t("copy")}
                </button>
              )}
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
            placeholder={mode === "encode" ? t("outputPlaceholderEncode") : t("outputPlaceholderDecode")}
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
