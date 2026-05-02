# FileFolks

Free, privacy-first file and developer tools that run entirely in your browser. No uploads, no accounts, no tracking.

**Live site:** [filefolks.com](https://filefolks.com)

---

## How it works

All file processing uses WebAssembly and browser APIs. Files never leave your device. You can verify this by opening your browser's Network tab while using any tool. No file upload requests will appear.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Fonts | DM Sans (body) + Lora (headings) + Nunito (logo) |
| i18n | next-intl v4 — 12 locales, per-namespace JSON under `messages/<locale>/<Namespace>.json` |
| PDF processing | pdf-lib, pdf-merger-js |
| Image processing | browser-image-compression + Canvas API |
| Archive | JSZip |
| Hosting | Azure Static Web Apps |

---

## Project structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx                  # HTML shell: fonts, NextIntlClientProvider, Header, Footer
│   │   ├── page.tsx                    # Homepage — tools grid grouped by category
│   │   ├── tools/
│   │   │   ├── [slug]/page.tsx         # Tool page — metadata + component registry
│   │   │   └── category/[slug]/page.tsx
│   │   └── privacy/page.tsx
│   ├── page.tsx                        # Root redirect → /en
│   └── tools/[slug]/page.tsx           # Legacy redirect → /en/tools/[slug]
├── components/
│   ├── shared/                         # ToolPageLayout, Header, Footer, RelatedTools, etc.
│   └── tools/                          # One "use client" component per tool
├── lib/
│   ├── processors/
│   │   ├── pdf.ts                      # PDF merge, split, compress, rotate
│   │   ├── image.ts                    # Resize, crop, convert, compress
│   │   ├── text.ts                     # Base64, URL, JWT, UUID, hash, word count, case,
│   │   │                               #   lorem ipsum, password, timestamp, JSON→CSV
│   │   ├── archive.ts                  # ZIP create / list / extract
│   │   └── video.ts                    # Frame capture, GIF encoding
│   └── utils/
│       ├── constants.ts                # Single source of truth: TOOLS, CATEGORIES
│       ├── toolNamespaces.ts           # Slug → i18n namespace mapping
│       ├── structured-data.ts          # JSON-LD generators
│       └── metadata.ts                 # hreflang alternates
└── i18n/
    ├── routing.ts                      # next-intl locale config (12 locales)
    └── navigation.ts                   # typed Link / useRouter wrappers
messages/
    <locale>/                           # One directory per locale (en, es, fr, de, …)
        <Namespace>.json                # One file per tool/section namespace
```

### Architecture rules

- **Processors** (`src/lib/processors/`) are pure functions with no React imports. Tested in isolation by Vitest.
- **Tool components** (`src/components/tools/`) are `"use client"` and import processors.
- **Tool pages** export `generateMetadata` and render `<ToolPageLayout>`. All component routing is in the `TOOL_COMPONENTS` registry in `[slug]/page.tsx`.
- **All tool metadata** lives in `constants.ts`. Footer, homepage grid, category pages, sitemap, and structured data all derive from it.
- **i18n messages** are per-namespace files. Each tool namespace holds both UI strings and SEO fields (`name`, `description`, `seoTitle`, `seoDescription`, `faqs`).

### Adding a new tool

1. Add the entry to `TOOLS` in `constants.ts` with full metadata.
2. Add slug → namespace to `src/lib/utils/toolNamespaces.ts`.
3. Add the namespace name to `src/i18n/request.ts`.
4. Add processor logic to `src/lib/processors/`.
5. Create the component in `src/components/tools/` (`"use client"`, uses `useTranslations`).
6. Register the component in `TOOL_COMPONENTS` in `src/app/[locale]/tools/[slug]/page.tsx`.
7. Create `messages/en/<Namespace>.json` with UI strings plus the six meta keys (`name`, `description`, `longDescription`, `seoTitle`, `seoDescription`, `faqs`).
8. Copy the English file to all other locale directories as a translation placeholder.

---

## Tools

### PDF (5)
- [x] Merge PDF — `pdf-merge`
- [x] Compress PDF — `compress-pdf`
- [x] Split PDF — `split-pdf`
- [x] Rotate PDF — `pdf-rotate`
- [x] Image to PDF — `image-to-pdf`

### Image (4)
- [x] Compress Image — `compress-image`
- [x] Convert Image (JPG / PNG / WebP) — `image-convert`
- [x] Resize Image — `image-resize`
- [x] Crop Image — `image-crop`

### Developer (9)
- [x] JSON Formatter — `json-formatter`
- [x] Base64 Encode / Decode — `base64-encode-decode`
- [x] URL Encode / Decode — `url-encode-decode`
- [x] JWT Decoder — `jwt-decoder`
- [x] UUID Generator — `uuid-generator`
- [x] Hash Generator (SHA-1/256/384/512) — `hash-generator`
- [x] Password Generator — `password-generator`
- [x] Timestamp Converter — `timestamp-converter`
- [x] JSON to CSV — `json-to-csv`

### Media (4)
- [x] Video to GIF — `video-to-gif`
- [x] Extract Frames — `extract-frames`
- [x] Video Thumbnail — `video-thumbnail`
- [x] Video Metadata — `video-metadata`

### Archive (2)
- [x] Create ZIP — `zip-files`
- [x] Extract ZIP — `unzip-files`

### Text (5)
- [x] Word Counter — `word-counter`
- [x] Case Converter — `case-converter`
- [x] Lorem Ipsum Generator — `lorem-ipsum-generator`
- [x] Remove Duplicate Lines — `duplicate-line-remover`
- [x] Line Sorter — `line-sorter`

---

## SEO strategy

FileFolks targets "privacy angle" long-tail queries — "compress pdf without uploading", "merge pdf no upload", "compress image without uploading" — which have low competition and growing volume. Every tool page includes:

- `seoTitle` and `seoDescription` per locale
- FAQPage JSON-LD structured data (auto-generated from the `faqs` array in each tool entry)
- Keywords covering both the primary query and "no upload / browser-based / private" variants
- hreflang alternates for all 12 locales

---

## Roadmap

### High-priority (P1/P2 from keyword research)

**PDF**
- [ ] PDF to Image (PNG / JPG) — needs PDF.js canvas rendering
- [ ] Protect / Unlock PDF — pdf-lib supports encryption

**Image**
- [ ] Convert to WebP (dedicated slug) — target "convert to webp" P1 keyword
- [ ] Image to Base64 — developer crossover, trivial build
- [ ] SVG to PNG — Canvas rasterization, low competition

**Developer**
- [ ] Color Converter (HEX / RGB / HSL) — P2, visual tool
- [ ] Regex Tester — P2, large audience
- [ ] Cron Parser / Expression Generator — P2, low competition

**Text**
- [ ] Markdown Preview — P2, marked.js
- [ ] Diff Checker — P2, side-by-side comparison
- [ ] Text to URL Slug — P3, very low competition

---

## Development

```bash
npm install
npm run dev         # http://localhost:3000
npm run build       # static export to /out
npm test            # Vitest test suite (runs on every commit and push via git hooks)
npm run test:watch
```

No environment variables required. All processing is client-side.

### i18n notes

- Routes always include the locale prefix: `/en/tools/pdf-merge`, `/fr/tools/compress-pdf`, etc.
- The root `/` redirects to `/en`.
- Messages live at `messages/<locale>/<Namespace>.json`. Each tool namespace holds component UI strings plus the six SEO/meta keys.
- To add a new locale: add it to `src/i18n/routing.ts` and create the directory with all required JSON files under `messages/<locale>/`.
