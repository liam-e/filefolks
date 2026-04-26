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
| i18n | next-intl v4 -- 12 locales, `localePrefix: "always"` |
| PDF processing | pdf-lib, pdf-merger-js |
| Image processing | browser-image-compression + Canvas API |
| Hosting | Static export (host TBD) |

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
│   │   │   └── category/[slug]/page.tsx  # Category listing page
│   │   ├── guides/[slug]/page.tsx
│   │   └── privacy/page.tsx
│   ├── page.tsx                        # Root redirect → /en
│   └── tools/[slug]/page.tsx           # Legacy redirect → /en/tools/[slug]
├── components/
│   ├── shared/
│   │   ├── ToolPageLayout.tsx          # Enforced layout for every tool page
│   │   ├── ToolIcon.tsx                # SVG icon lookup by tool slug / category
│   │   ├── Header.tsx / Footer.tsx
│   │   ├── ToolFaq.tsx                 # Accordion FAQ
│   │   ├── RelatedTools.tsx
│   │   └── FileDropzone.tsx
│   └── tools/                          # One "use client" component per tool
│       ├── PdfMerger.tsx
│       ├── PdfCompressor.tsx
│       ├── PdfSplitter.tsx
│       ├── PdfRotatorTool.tsx
│       ├── ImageToPdfTool.tsx
│       ├── ImageCompressor.tsx
│       ├── ImageConverter.tsx
│       ├── ImageResizerTool.tsx
│       ├── ImageCropTool.tsx
│       ├── JsonFormatter.tsx
│       ├── Base64Tool.tsx
│       ├── UrlEncoderTool.tsx
│       ├── JwtDecoderTool.tsx
│       ├── UuidGeneratorTool.tsx
│       └── HashGeneratorTool.tsx
├── lib/
│   ├── processors/
│   │   ├── pdf.ts                      # Pure functions, no React imports
│   │   ├── image.ts
│   │   └── text.ts
│   └── utils/
│       ├── constants.ts                # Single source of truth: TOOLS, CATEGORIES, PLANNED_TOOLS
│       ├── structured-data.ts          # JSON-LD generators
│       ├── metadata.ts                 # hreflang alternates helper
│       └── file.ts                     # downloadBlob, formatFileSize, etc.
└── i18n/
    ├── routing.ts                      # next-intl locale config (12 locales)
    └── navigation.ts                   # typed Link / useRouter wrappers
messages/
    en.json, es.json, fr.json, de.json, pt-BR.json,
    zh-CN.json, ja.json, ko.json, ru.json, ar.json, it.json, nl.json
```

### Architecture rules

- **Processors** (`src/lib/processors/`) are pure functions with no React imports. They can be tested in isolation.
- **Tool components** (`src/components/tools/`) are `"use client"` and import processors.
- **Tool pages** are thin: they export `generateMetadata`, appear in `generateStaticParams`, and render `<ToolPageLayout>`. All routing logic lives in `src/app/[locale]/tools/[slug]/page.tsx` via the `TOOL_COMPONENTS` registry.
- **All tool metadata** lives in `src/lib/utils/constants.ts` as the single source of truth. The footer, homepage grid, category pages, sitemap, and structured data all derive from it.

### Adding a new tool

1. Move the entry from `PLANNED_TOOLS` into `TOOLS` in `constants.ts` with full metadata (seoTitle, keywords, faqs, etc.).
2. Add the processor logic to `src/lib/processors/`.
3. Create the interactive component in `src/components/tools/` — `"use client"`, uses `useTranslations`.
4. Register the component in the `TOOL_COMPONENTS` map in `src/app/[locale]/tools/[slug]/page.tsx`.
5. Add an icon to the `TOOL_ICONS` map in `ToolIcon.tsx`.
6. Add translations to all 12 message files under the `tools` namespace (SEO/FAQ) and a component-level namespace (UI strings).

The FAQ section, related tools, JSON-LD structured data, and breadcrumbs are all handled automatically by `ToolPageLayout`.

---

## Tools

### PDF (5)
- [x] Merge PDF
- [x] Compress PDF
- [x] Split PDF
- [x] Rotate PDF
- [x] Image to PDF

### Image (5)
- [x] Compress Image
- [x] Convert Image
- [x] Resize Image
- [x] Crop Image
- [x] (Image to PDF — listed above)

### Developer (6)
- [x] JSON Formatter
- [x] Base64 Encode / Decode
- [x] URL Encode / Decode
- [x] JWT Decoder
- [x] UUID Generator
- [x] Hash Generator

### Media (2)
- [x] Video to GIF
- [x] Extract Frames

---

## Roadmap

### Next tools (ordered by estimated search volume)

**PDF**
- [ ] PDF to Image (PNG / JPG) — needs PDF.js
- [ ] PDF to Word — complex, likely needs server
- [ ] Protect / Unlock PDF
- [ ] Remove PDF pages

**Image**
- [ ] Rotate / Flip Image
- [ ] SVG Optimizer
- [ ] ICO / Favicon Converter
- [ ] Strip EXIF Metadata

**Developer**
- [ ] Regex Tester
- [ ] Diff Checker
- [ ] Timestamp Converter
- [ ] Color Converter (HEX / RGB / HSL)
- [ ] JSON to CSV / CSV to JSON
- [ ] XML Formatter
- [ ] Markdown Preview
- [ ] HTML Formatter

**Media / Video** (tools beyond the two already built require ffmpeg.wasm)
- [ ] Trim Video
- [ ] Compress Video
- [ ] MP4 to MP3
- [ ] Video to WebM

**Archive**
- [ ] Create ZIP / Extract ZIP
- [ ] Excel to CSV / JSON — needs SheetJS

**Text**
- [ ] Word Counter
- [ ] Case Converter
- [ ] Lorem Ipsum Generator
- [ ] CSV Viewer

### Discovery features
- [ ] Sitewide search — instant filter across all tools
- [ ] "Recently used" strip on homepage — localStorage
- [ ] Format info pages (`/formats/pdf`, `/formats/webp`, …)
- [ ] More guides with HowTo JSON-LD

---

## Development

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # static export to /out
```

No environment variables required. All processing is client-side.

### i18n notes

- Routes always include the locale prefix: `/en/tools/pdf-merge`, `/fr/tools/compress-pdf`, etc.
- The root `/` redirects to `/en` via a static redirect.
- Legacy non-locale paths (`/tools/pdf-merge`) redirect to `/en/tools/pdf-merge`.
- To add a new locale: add it to `src/i18n/routing.ts` and create the message file in `messages/`.
