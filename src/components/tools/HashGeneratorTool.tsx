"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { hashText, hashBuffer, type HashAlgorithm } from "@/lib/processors/text";

const ALGORITHMS: HashAlgorithm[] = ["SHA-256", "SHA-512", "SHA-384", "SHA-1"];

type InputMode = "text" | "file";

export function HashGeneratorTool() {
  const t = useTranslations("HashGenerator");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setInput("");
    setFileName(null);
    setOutput("");
    setError(null);
  }, []);

  const handleHash = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const hash = await hashText(input, algorithm);
      setOutput(hash);
    } catch {
      setError(t("errorTitle"));
    } finally {
      setBusy(false);
    }
  }, [input, algorithm, t]);

  const handleFileLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setOutput("");
    setError(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const buf = ev.target?.result;
      if (buf instanceof ArrayBuffer) {
        setBusy(true);
        try {
          const hash = await hashBuffer(buf, algorithm);
          setOutput(hash);
        } catch {
          setError(t("errorTitle"));
        } finally {
          setBusy(false);
        }
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }, [algorithm, t]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleModeSwitch = useCallback((m: InputMode) => {
    setInputMode(m);
    reset();
    if (m === "file") setTimeout(() => fileInputRef.current?.click(), 50);
  }, [reset]);

  return (
    <div className="space-y-6">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {error ?? ""}
      </div>

      {/* Algorithm selector */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t("algorithmLabel")}</label>
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit flex-wrap">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo}
              type="button"
              onClick={() => { setAlgorithm(algo); setOutput(""); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                algorithm === algo
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {algo}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("inputLabel")}</span>
          <div className="flex gap-3 items-center">
            <button
              type="button"
              onClick={() => handleModeSwitch("text")}
              className={`text-xs transition-colors ${inputMode === "text" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t("textMode")}
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("file")}
              className={`text-xs transition-colors ${inputMode === "file" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t("fileMode")}
            </button>
            <input ref={fileInputRef} type="file" className="sr-only" onChange={handleFileLoad} />
          </div>
        </div>

        {inputMode === "file" ? (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-center gap-3">
            {fileName ? (
              <>
                <span className="text-sm text-foreground flex-1 truncate">{fileName}</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
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
            placeholder={t("textPlaceholder")}
            spellCheck={false}
            rows={5}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}
      </div>

      {inputMode === "text" && (
        <Button size="xl" onClick={handleHash} disabled={busy || !input.trim()}>
          {busy ? t("hashing") : t("hashButton")}
        </Button>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
        </div>
      )}

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("outputLabel")} ({algorithm})</span>
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
          <div className="w-full rounded-lg border border-input bg-muted/30 px-4 py-3 font-mono text-sm break-all select-all">
            {output}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">{t("privacyNote")}</p>
    </div>
  );
}
