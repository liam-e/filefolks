export interface FormatJsonResult {
  formatted: string;
  valid: boolean;
  error?: string;
  stats: {
    keys: number;
    depth: number;
    sizeBytes: number;
  };
}

export function formatJson(input: string, indent: number = 2): FormatJsonResult {
  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, indent);

    return {
      formatted,
      valid: true,
      stats: {
        keys: countKeys(parsed),
        depth: measureDepth(parsed),
        sizeBytes: new Blob([formatted]).size,
      },
    };
  } catch (err) {
    return {
      formatted: input,
      valid: false,
      error: err instanceof Error ? err.message : "Invalid JSON",
      stats: { keys: 0, depth: 0, sizeBytes: 0 },
    };
  }
}

function countKeys(obj: unknown): number {
  if (typeof obj !== "object" || obj === null) return 0;
  if (Array.isArray(obj)) return obj.reduce((sum, item) => sum + countKeys(item), 0);
  return Object.keys(obj).length +
    Object.values(obj).reduce((sum: number, val) => sum + countKeys(val), 0);
}

function measureDepth(obj: unknown, current: number = 0): number {
  if (typeof obj !== "object" || obj === null) return current;
  if (Array.isArray(obj)) {
    return Math.max(current + 1, ...obj.map((item) => measureDepth(item, current + 1)));
  }
  return Math.max(
    current + 1,
    ...Object.values(obj).map((val) => measureDepth(val, current + 1))
  );
}
