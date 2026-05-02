import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { TOOLS } from "@/lib/utils/constants";
import { SLUG_TO_NAMESPACE } from "@/lib/utils/toolNamespaces";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = resolve(__dirname, "../../../messages");

const LOCALES = ["en", "es", "fr", "de", "pt-BR", "zh-CN", "ja", "ko", "ru", "ar", "it", "nl"];

const SHARED_NAMESPACES = ["Header", "Footer", "Home", "ToolPageLayout", "Categories", "Privacy", "About"];
const TOOL_NAMESPACES = [
  "PdfMerger", "PdfCompressor", "JsonFormatter", "ImageCompressor", "ImageConverter",
  "PdfSplitter", "Base64", "ImageToPdf", "PdfRotator", "ImageResizer", "ImageCrop",
  "UrlEncoder", "JwtDecoder", "UuidGenerator", "HashGenerator", "VideoToGif",
  "ExtractFrames", "VideoThumbnail", "VideoMetadata", "ZipFiles", "UnzipFiles",
  "WordCounter", "CaseConverter", "LoremIpsum", "DuplicateLineRemover", "LineSorter",
  "PasswordGenerator", "TimestampConverter", "JsonToCsv",
];
const ALL_NAMESPACES = [...SHARED_NAMESPACES, ...TOOL_NAMESPACES];
const META_KEYS = ["name", "description", "longDescription", "seoTitle", "seoDescription", "faqs"];

function readJson(locale: string, ns: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(MESSAGES_DIR, locale, `${ns}.json`), "utf-8"));
}

// ─── File presence ───────────────────────────────────────────────────────────

describe("namespace files exist", () => {
  it.each(LOCALES)("%s has all namespace JSON files", (locale) => {
    for (const ns of ALL_NAMESPACES) {
      expect(
        existsSync(resolve(MESSAGES_DIR, locale, `${ns}.json`)),
        `${locale}/${ns}.json is missing`
      ).toBe(true);
    }
  });
});

// ─── Tool meta keys ──────────────────────────────────────────────────────────

describe("tool namespace meta keys", () => {
  it.each(LOCALES)("%s — every tool namespace has all required meta keys", (locale) => {
    for (const ns of TOOL_NAMESPACES) {
      const data = readJson(locale, ns);
      for (const key of META_KEYS) {
        expect(data, `${locale}/${ns}.json is missing key "${key}"`).toHaveProperty(key);
      }
    }
  });
});

// ─── Categories completeness ─────────────────────────────────────────────────

describe("Categories.json completeness", () => {
  const CATEGORY_KEYS = ["pdf", "image", "developer", "text", "media", "archive"];

  it.each(LOCALES)("%s — Categories.json has all category keys", (locale) => {
    const data = readJson(locale, "Categories");
    for (const key of CATEGORY_KEYS) {
      expect(data, `${locale}/Categories.json missing key "${key}"`).toHaveProperty(key);
    }
  });
});

// ─── SLUG_TO_NAMESPACE consistency ───────────────────────────────────────────

describe("SLUG_TO_NAMESPACE", () => {
  it("covers every slug in the TOOLS array", () => {
    for (const tool of TOOLS) {
      expect(
        SLUG_TO_NAMESPACE,
        `No namespace mapping for tool slug "${tool.slug}"`
      ).toHaveProperty(tool.slug);
    }
  });

  it("has no entries for slugs absent from TOOLS", () => {
    const toolSlugs = new Set(TOOLS.map((t) => t.slug));
    for (const slug of Object.keys(SLUG_TO_NAMESPACE)) {
      expect(toolSlugs.has(slug), `SLUG_TO_NAMESPACE has unknown slug "${slug}"`).toBe(true);
    }
  });

  it("every mapped namespace file exists in en/", () => {
    for (const [slug, ns] of Object.entries(SLUG_TO_NAMESPACE)) {
      expect(
        existsSync(resolve(MESSAGES_DIR, "en", `${ns}.json`)),
        `Slug "${slug}" maps to "${ns}" but en/${ns}.json does not exist`
      ).toBe(true);
    }
  });
});
