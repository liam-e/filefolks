"use client";

import { useState, useCallback } from "react";

export type ProcessingStatus = "idle" | "processing" | "done" | "error";

interface UseFileProcessorOptions<TInput, TOutput> {
  processor: (input: TInput) => Promise<TOutput>;
}

export function useFileProcessor<TInput, TOutput>({
  processor,
}: UseFileProcessorOptions<TInput, TOutput>) {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<TOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const process = useCallback(
    async (input: TInput) => {
      setStatus("processing");
      setProgress(0);
      setError(null);
      setResult(null);

      try {
        const output = await processor(input);
        setResult(output);
        setStatus("done");
        setProgress(100);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Processing failed");
        setStatus("error");
      }
    },
    [processor]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return { status, progress, result, error, process, reset };
}
