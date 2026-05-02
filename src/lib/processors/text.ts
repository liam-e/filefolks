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

// ─── Word counter ──────────────────────────────────────────────

export interface WordCount {
  words: number;
  chars: number;
  charsNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMin: number;
}

export function countText(text: string): WordCount {
  const empty = { words: 0, chars: 0, charsNoSpaces: 0, sentences: 0, paragraphs: 0, readingTimeMin: 0 };
  if (!text.trim()) return empty;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length);
  const paragraphs = Math.max(1, text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length);
  const readingTimeMin = Math.max(1, Math.round(words / 238));
  return { words, chars, charsNoSpaces, sentences, paragraphs, readingTimeMin };
}

// ─── Case converter ────────────────────────────────────────────

export type CaseType = "camel" | "pascal" | "snake" | "kebab" | "screaming" | "title" | "upper" | "lower";

function tokenize(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s\-_]+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

export function convertCase(input: string, target: CaseType): string {
  const words = tokenize(input);
  if (words.length === 0) return input;
  switch (target) {
    case "camel":
      return words[0].toLowerCase() + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "pascal":
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "snake":
      return words.map((w) => w.toLowerCase()).join("_");
    case "kebab":
      return words.map((w) => w.toLowerCase()).join("-");
    case "screaming":
      return words.map((w) => w.toUpperCase()).join("_");
    case "title":
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    case "upper":
      return words.map((w) => w.toUpperCase()).join(" ");
    case "lower":
      return words.map((w) => w.toLowerCase()).join(" ");
  }
}

// ─── Lorem ipsum ───────────────────────────────────────────────

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit",
  "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "perspiciatis", "unde",
  "omnis", "iste", "natus", "error", "voluptatem", "accusantium", "doloremque",
  "laudantium", "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab",
  "inventore", "veritatis", "architecto", "beatae", "vitae", "dicta", "explicabo",
  "aspernatur", "odit", "fugit", "consequuntur", "magni", "dolores", "ratione",
  "sequi", "nesciunt", "neque", "porro", "quisquam", "dolorem", "adipisci",
];

const CLASSIC_OPENING = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function randWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function randSentence(): string {
  const count = 8 + Math.floor(Math.random() * 12);
  const sentence = Array.from({ length: count }, randWord).join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function randParagraph(): string {
  return Array.from({ length: 3 + Math.floor(Math.random() * 4) }, randSentence).join(" ");
}

export type LoremUnit = "paragraphs" | "sentences" | "words";

export function generateLorem(count: number, unit: LoremUnit, classicStart: boolean): string {
  if (unit === "words") {
    const words = Array.from({ length: count }, randWord);
    const text = (classicStart ? "Lorem ipsum dolor sit amet " : "") + words.join(" ");
    return text.charAt(0).toUpperCase() + text.slice(1) + ".";
  }
  if (unit === "sentences") {
    const result: string[] = classicStart ? [CLASSIC_OPENING] : [];
    while (result.length < count) result.push(randSentence());
    return result.slice(0, count).join(" ");
  }
  const result: string[] = [];
  if (classicStart) {
    const extra = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, randSentence);
    result.push([CLASSIC_OPENING, ...extra].join(" "));
  }
  while (result.length < count) result.push(randParagraph());
  return result.slice(0, count).join("\n\n");
}

// ─── Duplicate line removal ────────────────────────────────────

export interface DedupeOptions {
  caseSensitive: boolean;
  trimLines: boolean;
  removeEmpty: boolean;
}

export function removeDuplicateLines(text: string, opts: DedupeOptions): { result: string; removed: number } {
  const lines = text.split("\n");
  const seen = new Set<string>();
  const kept: string[] = [];
  let removed = 0;
  for (const line of lines) {
    const processed = opts.trimLines ? line.trim() : line;
    if (opts.removeEmpty && processed === "") { removed++; continue; }
    const key = opts.caseSensitive ? processed : processed.toLowerCase();
    if (seen.has(key)) { removed++; continue; }
    seen.add(key);
    kept.push(opts.trimLines ? processed : line);
  }
  return { result: kept.join("\n"), removed };
}

// ─── Line sorter ───────────────────────────────────────────────

export type SortOrder = "az" | "za" | "shortest" | "longest" | "random";

export function sortLines(text: string, order: SortOrder, caseSensitive: boolean): string {
  const lines = text.split("\n");
  const sorted = [...lines];
  switch (order) {
    case "az":
      sorted.sort((a, b) => caseSensitive ? a.localeCompare(b) : a.toLowerCase().localeCompare(b.toLowerCase()));
      break;
    case "za":
      sorted.sort((a, b) => caseSensitive ? b.localeCompare(a) : b.toLowerCase().localeCompare(a.toLowerCase()));
      break;
    case "shortest":
      sorted.sort((a, b) => a.length - b.length);
      break;
    case "longest":
      sorted.sort((a, b) => b.length - a.length);
      break;
    case "random":
      for (let i = sorted.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
      }
      break;
  }
  return sorted.join("\n");
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
