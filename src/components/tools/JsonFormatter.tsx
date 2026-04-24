"use client";

import { useState, useCallback, useRef } from "react";
import { formatJson, type FormatJsonResult } from "@/lib/processors/text";
import { Button } from "@/components/ui/button";

const SAMPLE_JSON = `{
  "name": "FileFolks",
  "version": "1.0.0",
  "description": "Privacy-first file tools",
  "tools": ["pdf-merge", "json-formatter", "image-convert"],
  "config": {
    "clientSide": true,
    "uploadsToServer": false,
    "openSource": true
  }
}`;

export function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<FormatJsonResult | null>(null);
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    const formatted = formatJson(input, indent);
    setResult(formatted);
  }, [input, indent]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    const formatted = formatJson(input, 0);
    setResult(formatted);
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!result?.formatted) return;
    try {
      await navigator.clipboard.writeText(result.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      outputRef.current?.select();
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_JSON);
    setResult(null);
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setResult(null);
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          setInput(text);
          setResult(null);
        }
      };
      reader.readAsText(file);
      // Reset the input so the same file can be selected again
      e.target.value = "";
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleFormat} disabled={!input.trim()}>
          Format
        </Button>
        <Button variant="outline" onClick={handleMinify} disabled={!input.trim()}>
          Minify
        </Button>

        {/* Indent selector */}
        <div className="flex items-center gap-2 ml-auto">
          <label
            htmlFor="indent-select"
            className="text-sm text-muted-foreground"
          >
            Indent
          </label>
          <select
            id="indent-select"
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>1 tab (as spaces)</option>
          </select>
        </div>
      </div>

      {/* Input / Output panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Input</span>
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                <UploadIcon />
                Upload .json
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Load sample
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                disabled={!input}
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setResult(null);
            }}
            placeholder="Paste your JSON here..."
            spellCheck={false}
            className="w-full h-80 rounded-lg border border-input bg-background px-4 py-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Output
              {result && !result.valid && (
                <span className="ml-2 text-xs text-destructive font-normal">
                  Invalid JSON
                </span>
              )}
              {result?.valid && (
                <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-normal">
                  Valid
                </span>
              )}
            </span>
            {result?.formatted && (
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <textarea
            ref={outputRef}
            value={result?.formatted ?? ""}
            readOnly
            placeholder="Formatted output will appear here..."
            spellCheck={false}
            className="w-full h-80 rounded-lg border border-input bg-muted/30 px-4 py-3 font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* Error message */}
      {result && !result.valid && result.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">Parse error</p>
          <p className="text-sm text-destructive/80 mt-1 font-mono">
            {result.error}
          </p>
        </div>
      )}

      {/* Stats */}
      {result?.valid && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Keys" value={result.stats.keys.toLocaleString()} />
          <StatCard label="Depth" value={result.stats.depth.toString()} />
          <StatCard label="Size" value={formatSize(result.stats.sizeBytes)} />
        </div>
      )}

      {/* Privacy note */}
      <p className="text-xs text-muted-foreground text-center pt-2">
        Your data never leaves your browser. All processing happens locally on
        your device.
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-medium mt-0.5">{value}</p>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
