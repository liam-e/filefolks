import { describe, it, expect } from "vitest";
import {
  encodeBase64,
  decodeBase64,
  encodeFileToBase64,
  encodeUrl,
  decodeUrl,
  formatJson,
  decodeJwt,
  generateUuids,
  hashText,
  hashBuffer,
  countText,
  convertCase,
  sortLines,
  removeDuplicateLines,
  generateLorem,
  generatePassword,
  passwordStrength,
  convertTimestamp,
  dateToTimestamp,
  currentUnixTimestamp,
  jsonToCsv,
} from "@/lib/processors/text";

// ─── Base64 ──────────────────────────────────────────────────────────────────

describe("encodeBase64 / decodeBase64", () => {
  it("roundtrips ASCII text", () => {
    expect(decodeBase64(encodeBase64("hello"))).toBe("hello");
  });
  it("roundtrips unicode text", () => {
    const input = "héllo wörld 🎉";
    expect(decodeBase64(encodeBase64(input))).toBe(input);
  });
  it("decodeBase64 strips surrounding whitespace", () => {
    const encoded = encodeBase64("test");
    expect(decodeBase64(`  ${encoded}  `)).toBe("test");
  });
  it("decodeBase64 strips embedded newlines", () => {
    const encoded = encodeBase64("abc");
    expect(decodeBase64(`${encoded.slice(0, 4)}\n${encoded.slice(4)}`)).toBe("abc");
  });
});

describe("encodeFileToBase64", () => {
  it("encodes an ArrayBuffer and roundtrips via decodeBase64", () => {
    const buf = new TextEncoder().encode("hello").buffer as ArrayBuffer;
    expect(decodeBase64(encodeFileToBase64(buf))).toBe("hello");
  });
});

// ─── URL encode / decode ─────────────────────────────────────────────────────

describe("encodeUrl / decodeUrl", () => {
  it("encodes spaces as %20", () => {
    expect(encodeUrl("hello world")).toBe("hello%20world");
  });
  it("encodes = and & characters", () => {
    expect(encodeUrl("a=1&b=2")).toBe("a%3D1%26b%3D2");
  });
  it("roundtrips arbitrary text", () => {
    const original = "/path?q=hello world&lang=de#section";
    expect(decodeUrl(encodeUrl(original))).toBe(original);
  });
  it("decodeUrl strips whitespace", () => {
    expect(decodeUrl("  hello%20world  ")).toBe("hello world");
  });
});

// ─── formatJson ──────────────────────────────────────────────────────────────

describe("formatJson", () => {
  it("formats valid JSON with default indent of 2", () => {
    expect(formatJson('{"a":1}').formatted).toBe('{\n  "a": 1\n}');
  });
  it("respects custom indent", () => {
    expect(formatJson('{"a":1}', 4).formatted).toBe('{\n    "a": 1\n}');
  });
  it("marks valid JSON as valid", () => {
    expect(formatJson('{"a":1}').valid).toBe(true);
  });
  it("marks invalid JSON as invalid and returns error", () => {
    const result = formatJson("{invalid}");
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.formatted).toBe("{invalid}");
  });
  it("counts keys recursively", () => {
    expect(formatJson('{"a":1,"b":{"c":2}}').stats.keys).toBe(3);
  });
  it("measures nesting depth", () => {
    expect(formatJson('{"a":{"b":{"c":1}}}').stats.depth).toBe(3);
  });
  it("reports positive sizeBytes for non-empty JSON", () => {
    expect(formatJson('{"a":1}').stats.sizeBytes).toBeGreaterThan(0);
  });
  it("reports zero stats for invalid JSON", () => {
    const { stats } = formatJson("{bad}");
    expect(stats).toEqual({ keys: 0, depth: 0, sizeBytes: 0 });
  });
  it("handles JSON arrays at root", () => {
    const result = formatJson("[1,2,3]");
    expect(result.valid).toBe(true);
    expect(result.stats.keys).toBe(0);
  });
});

// ─── decodeJwt ───────────────────────────────────────────────────────────────

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ" +
  ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

describe("decodeJwt", () => {
  it("decodes header fields", () => {
    const { header } = decodeJwt(SAMPLE_JWT);
    expect(header.alg).toBe("HS256");
    expect(header.typ).toBe("JWT");
  });
  it("decodes payload fields", () => {
    const { payload } = decodeJwt(SAMPLE_JWT);
    expect(payload.name).toBe("John Doe");
    expect(payload.sub).toBe("1234567890");
  });
  it("returns the signature part", () => {
    expect(decodeJwt(SAMPLE_JWT).signaturePart).toBeTruthy();
  });
  it("marks a valid JWT as valid", () => {
    expect(decodeJwt(SAMPLE_JWT).valid).toBe(true);
  });
  it("rejects a token with fewer than 3 parts", () => {
    const result = decodeJwt("only.two");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/3/);
  });
  it("rejects malformed base64url segments", () => {
    const result = decodeJwt("!!!.!!!.!!!");
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });
  it("trims surrounding whitespace from the token", () => {
    expect(decodeJwt(`  ${SAMPLE_JWT}  `).valid).toBe(true);
  });
});

// ─── generateUuids ───────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("generateUuids", () => {
  it("generates the requested count", () => {
    expect(generateUuids(5)).toHaveLength(5);
  });
  it("each UUID matches v4 format", () => {
    generateUuids(5).forEach((id) => expect(id).toMatch(UUID_RE));
  });
  it("clamps minimum to 1", () => {
    expect(generateUuids(0)).toHaveLength(1);
  });
  it("clamps maximum to 100", () => {
    expect(generateUuids(999)).toHaveLength(100);
  });
  it("generates unique values", () => {
    const ids = generateUuids(20);
    expect(new Set(ids).size).toBe(20);
  });
});

// ─── hashText / hashBuffer ───────────────────────────────────────────────────

describe("hashText", () => {
  it("SHA-1 produces a 40-char hex string", async () => {
    expect(await hashText("hello", "SHA-1")).toHaveLength(40);
  });
  it("SHA-256 produces a 64-char hex string", async () => {
    expect(await hashText("hello", "SHA-256")).toHaveLength(64);
  });
  it("SHA-384 produces a 96-char hex string", async () => {
    expect(await hashText("hello", "SHA-384")).toHaveLength(96);
  });
  it("SHA-512 produces a 128-char hex string", async () => {
    expect(await hashText("hello", "SHA-512")).toHaveLength(128);
  });
  it("output is lowercase hex only", async () => {
    expect(await hashText("test", "SHA-256")).toMatch(/^[0-9a-f]+$/);
  });
  it("same input always produces the same hash", async () => {
    const a = await hashText("deterministic", "SHA-256");
    const b = await hashText("deterministic", "SHA-256");
    expect(a).toBe(b);
  });
  it("different inputs produce different hashes", async () => {
    const a = await hashText("foo", "SHA-256");
    const b = await hashText("bar", "SHA-256");
    expect(a).not.toBe(b);
  });
});

describe("hashBuffer", () => {
  it("hashes an ArrayBuffer to a hex string", async () => {
    const buf = new TextEncoder().encode("hello").buffer as ArrayBuffer;
    expect(await hashBuffer(buf, "SHA-256")).toHaveLength(64);
  });
  it("matches hashText for the same content", async () => {
    const text = "same content";
    const buf = new TextEncoder().encode(text).buffer as ArrayBuffer;
    expect(await hashBuffer(buf, "SHA-256")).toBe(await hashText(text, "SHA-256"));
  });
});

// ─── countText ───────────────────────────────────────────────────────────────

describe("countText", () => {
  it("returns all zeros for empty string", () => {
    expect(countText("")).toEqual({
      words: 0, chars: 0, charsNoSpaces: 0,
      sentences: 0, paragraphs: 0, readingTimeMin: 0,
    });
  });
  it("returns zeros for whitespace-only input", () => {
    expect(countText("   \n  ").words).toBe(0);
  });
  it("counts words", () => {
    expect(countText("one two three").words).toBe(3);
  });
  it("counts chars including spaces", () => {
    expect(countText("hello world").chars).toBe(11);
  });
  it("counts chars excluding spaces", () => {
    expect(countText("hello world").charsNoSpaces).toBe(10);
  });
  it("counts sentence-ending punctuation", () => {
    expect(countText("Hello. World! How?").sentences).toBe(3);
  });
  it("counts paragraphs separated by blank lines", () => {
    expect(countText("First paragraph.\n\nSecond paragraph.").paragraphs).toBe(2);
  });
  it("single paragraph has readingTimeMin of at least 1", () => {
    expect(countText("hello world").readingTimeMin).toBeGreaterThanOrEqual(1);
  });
  it("calculates reading time at 238 wpm", () => {
    const text = Array(476).fill("word").join(" ");
    expect(countText(text).readingTimeMin).toBe(2);
  });
});

// ─── convertCase ─────────────────────────────────────────────────────────────

describe("convertCase", () => {
  const words = "hello world test";
  it("camel", () => expect(convertCase(words, "camel")).toBe("helloWorldTest"));
  it("pascal", () => expect(convertCase(words, "pascal")).toBe("HelloWorldTest"));
  it("snake", () => expect(convertCase(words, "snake")).toBe("hello_world_test"));
  it("kebab", () => expect(convertCase(words, "kebab")).toBe("hello-world-test"));
  it("screaming", () => expect(convertCase(words, "screaming")).toBe("HELLO_WORLD_TEST"));
  it("title", () => expect(convertCase(words, "title")).toBe("Hello World Test"));
  it("upper", () => expect(convertCase(words, "upper")).toBe("HELLO WORLD TEST"));
  it("lower", () => expect(convertCase(words, "lower")).toBe("hello world test"));

  it("splits camelCase input tokens", () => {
    expect(convertCase("helloWorldTest", "snake")).toBe("hello_world_test");
  });
  it("splits kebab-case input tokens", () => {
    expect(convertCase("hello-world-test", "camel")).toBe("helloWorldTest");
  });
  it("splits snake_case input tokens", () => {
    expect(convertCase("hello_world_test", "pascal")).toBe("HelloWorldTest");
  });
  it("returns empty string unchanged", () => {
    expect(convertCase("", "camel")).toBe("");
  });
});

// ─── sortLines ───────────────────────────────────────────────────────────────

describe("sortLines", () => {
  const lines = "banana\napple\ncherry";

  it("az — ascending alphabetical", () => {
    expect(sortLines(lines, "az", false)).toBe("apple\nbanana\ncherry");
  });
  it("za — descending alphabetical", () => {
    expect(sortLines(lines, "za", false)).toBe("cherry\nbanana\napple");
  });
  it("shortest — shortest first", () => {
    expect(sortLines("longestword\nhi\nmedium", "shortest", false)).toBe("hi\nmedium\nlongestword");
  });
  it("longest — longest first", () => {
    expect(sortLines("longestword\nhi\nmedium", "longest", false)).toBe("longestword\nmedium\nhi");
  });
  it("random — preserves all lines", () => {
    const result = sortLines(lines, "random", false).split("\n").sort();
    expect(result).toEqual(["apple", "banana", "cherry"]);
  });
  it("az case-insensitive ignores capitalisation", () => {
    expect(sortLines("Banana\napple", "az", false)).toBe("apple\nBanana");
  });
  it("az case-sensitive puts uppercase before lowercase", () => {
    expect(sortLines("banana\nApple", "az", true)).toBe("Apple\nbanana");
  });
});

// ─── removeDuplicateLines ────────────────────────────────────────────────────

describe("removeDuplicateLines", () => {
  const base = { caseSensitive: true, trimLines: false, removeEmpty: false };

  it("removes exact duplicate lines", () => {
    const { result, removed } = removeDuplicateLines("a\nb\na\nc", base);
    expect(result).toBe("a\nb\nc");
    expect(removed).toBe(1);
  });
  it("preserves first occurrence order", () => {
    const { result } = removeDuplicateLines("b\na\nb", base);
    expect(result).toBe("b\na");
  });
  it("case-insensitive dedup collapses different-case duplicates", () => {
    const { removed } = removeDuplicateLines("Hello\nhello\nHELLO", {
      ...base, caseSensitive: false,
    });
    expect(removed).toBe(2);
  });
  it("case-sensitive keeps lines that differ only in case", () => {
    const { removed } = removeDuplicateLines("Hello\nhello", base);
    expect(removed).toBe(0);
  });
  it("trimLines normalises whitespace before comparing", () => {
    const { removed } = removeDuplicateLines("hello  \n  hello", {
      ...base, trimLines: true,
    });
    expect(removed).toBe(1);
  });
  it("removeEmpty discards blank lines", () => {
    const { result, removed } = removeDuplicateLines("a\n\nb", {
      ...base, removeEmpty: true,
    });
    expect(result).toBe("a\nb");
    expect(removed).toBe(1);
  });
  it("no duplicates returns removed=0", () => {
    expect(removeDuplicateLines("a\nb\nc", base).removed).toBe(0);
  });
});

// ─── generateLorem ───────────────────────────────────────────────────────────

describe("generateLorem", () => {
  it("words — returns a non-empty string", () => {
    expect(generateLorem(10, "words", false).trim().length).toBeGreaterThan(0);
  });
  it("words — classicStart begins with 'Lorem ipsum'", () => {
    expect(generateLorem(5, "words", true).toLowerCase()).toContain("lorem ipsum");
  });
  it("sentences — produces the requested number of sentence endings", () => {
    const text = generateLorem(3, "sentences", false);
    expect((text.match(/\./g) ?? []).length).toBeGreaterThanOrEqual(3);
  });
  it("sentences — classicStart begins with the classic opening", () => {
    expect(generateLorem(2, "sentences", true)).toMatch(/^Lorem ipsum dolor sit amet/);
  });
  it("paragraphs — produces the requested number of paragraphs", () => {
    expect(generateLorem(3, "paragraphs", false).split("\n\n")).toHaveLength(3);
  });
  it("paragraphs — classicStart embeds the classic opening", () => {
    expect(generateLorem(2, "paragraphs", true)).toContain("Lorem ipsum dolor sit amet");
  });
});

// ─── generatePassword ─────────────────────────────────────────────────────────

describe("generatePassword", () => {
  const base = { length: 16, uppercase: true, lowercase: true, digits: true, symbols: false };

  it("returns a string of the requested length", () => {
    expect(generatePassword(base)).toHaveLength(16);
  });
  it("clamps minimum length to 4", () => {
    expect(generatePassword({ ...base, length: 0 })).toHaveLength(4);
  });
  it("clamps maximum length to 128", () => {
    expect(generatePassword({ ...base, length: 999 })).toHaveLength(128);
  });
  it("contains only uppercase when only uppercase enabled", () => {
    const pw = generatePassword({ length: 20, uppercase: true, lowercase: false, digits: false, symbols: false });
    expect(pw).toMatch(/^[A-Z]+$/);
  });
  it("contains only digits when only digits enabled", () => {
    const pw = generatePassword({ length: 20, uppercase: false, lowercase: false, digits: true, symbols: false });
    expect(pw).toMatch(/^[0-9]+$/);
  });
  it("includes at least one character from each enabled set", () => {
    const pw = generatePassword({ length: 32, uppercase: true, lowercase: true, digits: true, symbols: true });
    expect(pw).toMatch(/[A-Z]/);
    expect(pw).toMatch(/[a-z]/);
    expect(pw).toMatch(/[0-9]/);
    expect(pw).toMatch(/[^A-Za-z0-9]/);
  });
  it("generates unique passwords on each call", () => {
    const a = generatePassword(base);
    const b = generatePassword(base);
    expect(a).not.toBe(b);
  });
});

describe("passwordStrength", () => {
  it("rates a short lowercase-only password as weak", () => {
    expect(passwordStrength("abc")).toBe("weak");
  });
  it("rates a long mixed-character password as very-strong", () => {
    expect(passwordStrength("A1b!C2d@E3f#G4h$")).toBe("very-strong");
  });
  it("rates a short mixed-case+digits password as fair", () => {
    expect(passwordStrength("abcDEF12")).toBe("fair");
  });
});

// ─── convertTimestamp ────────────────────────────────────────────────────────

describe("convertTimestamp", () => {
  const KNOWN_UNIX = 1700000000;
  const KNOWN_ISO = "2023-11-14T22:13:20.000Z";

  it("converts a seconds timestamp to ISO string", () => {
    expect(convertTimestamp(KNOWN_UNIX).iso).toBe(KNOWN_ISO);
  });
  it("auto-detects millisecond timestamps", () => {
    const result = convertTimestamp(KNOWN_UNIX * 1000);
    expect(result.isMilliseconds).toBe(true);
    expect(result.iso).toBe(KNOWN_ISO);
  });
  it("auto-detects seconds timestamps", () => {
    expect(convertTimestamp(KNOWN_UNIX).isMilliseconds).toBe(false);
  });
  it("unix field is in seconds", () => {
    expect(convertTimestamp(KNOWN_UNIX).unix).toBe(KNOWN_UNIX);
  });
  it("unixMs field is unix * 1000", () => {
    const r = convertTimestamp(KNOWN_UNIX);
    expect(r.unixMs).toBe(r.unix * 1000);
  });
  it("throws for non-numeric input", () => {
    expect(() => convertTimestamp("not-a-number")).toThrow();
  });
  it("accepts a numeric string", () => {
    expect(convertTimestamp(String(KNOWN_UNIX)).iso).toBe(KNOWN_ISO);
  });
});

describe("dateToTimestamp", () => {
  it("converts an ISO date string to a Unix timestamp", () => {
    expect(dateToTimestamp("2023-11-14T22:13:20.000Z")).toBe(1700000000);
  });
  it("throws for an invalid date string", () => {
    expect(() => dateToTimestamp("not-a-date")).toThrow();
  });
});

describe("currentUnixTimestamp", () => {
  it("returns a number close to Date.now() / 1000", () => {
    const ts = currentUnixTimestamp();
    const expected = Math.floor(Date.now() / 1000);
    expect(Math.abs(ts - expected)).toBeLessThanOrEqual(1);
  });
});

// ─── jsonToCsv ───────────────────────────────────────────────────────────────

describe("jsonToCsv", () => {
  it("converts a simple array of objects", () => {
    const { csv, headers, rowCount } = jsonToCsv('[{"a":1,"b":2},{"a":3,"b":4}]');
    expect(headers).toEqual(["a", "b"]);
    expect(rowCount).toBe(2);
    expect(csv).toBe("a,b\n1,2\n3,4");
  });
  it("returns error for non-array JSON", () => {
    const { error } = jsonToCsv('{"a":1}');
    expect(error).toBeTruthy();
  });
  it("returns error for invalid JSON", () => {
    const { error } = jsonToCsv("{bad json}");
    expect(error).toBeTruthy();
  });
  it("handles empty array", () => {
    const { csv, rowCount } = jsonToCsv("[]");
    expect(rowCount).toBe(0);
    expect(csv).toBe("");
  });
  it("escapes commas inside field values", () => {
    const { csv } = jsonToCsv('[{"name":"Smith, John"}]');
    expect(csv).toContain('"Smith, John"');
  });
  it("escapes double quotes inside field values", () => {
    const { csv } = jsonToCsv('[{"q":"say \\"hi\\""}]');
    expect(csv).toContain('""hi""');
  });
  it("handles missing keys with empty cells", () => {
    const { csv } = jsonToCsv('[{"a":1,"b":2},{"a":3}]');
    expect(csv).toBe("a,b\n1,2\n3,");
  });
  it("collects all unique keys as headers", () => {
    const { headers } = jsonToCsv('[{"a":1},{"b":2}]');
    expect(headers).toContain("a");
    expect(headers).toContain("b");
  });
});
