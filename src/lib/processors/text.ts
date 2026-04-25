export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function decodeBase64(base64: string): string {
  const cleaned = base64.trim().replace(/[\r\n\s]/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeFileToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

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
