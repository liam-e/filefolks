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

// ─── URL encode / decode ───────────────────────────────────────

export function encodeUrl(text: string): string {
  return encodeURIComponent(text);
}

export function decodeUrl(encoded: string): string {
  return decodeURIComponent(encoded.trim());
}

// ─── JWT decode ────────────────────────────────────────────────

export interface JwtDecodeResult {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signaturePart: string;
  valid: boolean;
  error?: string;
}

function b64UrlDecode(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    s.length + (4 - (s.length % 4)) % 4, "="
  );
  return atob(padded);
}

export function decodeJwt(token: string): JwtDecodeResult {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { header: {}, payload: {}, signaturePart: "", valid: false, error: "Invalid JWT — expected 3 dot-separated parts." };
  }
  try {
    const header = JSON.parse(b64UrlDecode(parts[0])) as Record<string, unknown>;
    const payload = JSON.parse(b64UrlDecode(parts[1])) as Record<string, unknown>;
    return { header, payload, signaturePart: parts[2], valid: true };
  } catch {
    return { header: {}, payload: {}, signaturePart: "", valid: false, error: "Could not decode JWT — the token may be malformed." };
  }
}

// ─── UUID generator ────────────────────────────────────────────

export function generateUuids(count: number): string[] {
  return Array.from({ length: Math.max(1, Math.min(count, 100)) }, () =>
    crypto.randomUUID()
  );
}

// ─── Hash generator ────────────────────────────────────────────

export type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

async function computeHash(data: BufferSource, algorithm: HashAlgorithm): Promise<string> {
  const buf = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashText(text: string, algorithm: HashAlgorithm): Promise<string> {
  return computeHash(new TextEncoder().encode(text), algorithm);
}

export async function hashBuffer(buffer: ArrayBuffer, algorithm: HashAlgorithm): Promise<string> {
  return computeHash(buffer, algorithm);
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
