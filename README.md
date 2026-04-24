# FileFolks

Free, privacy-first file and developer tools that run entirely in your browser. No uploads, no accounts, no tracking.

**Live site:** [filefolks.com](https://filefolks.com)

---

## How it works

All file processing uses WebAssembly and browser APIs. Files never leave your device. You can verify this by opening your browser's Network tab while using any tool — no file upload requests will appear.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| PDF processing | pdf-lib |
| Image processing | browser-image-compression |
| Hosting | Azure Static Web Apps |

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                  # Homepage — tools grid
│   ├── layout.tsx                # Root layout (Header + Footer)
│   ├── tools/[slug]/page.tsx     # One file per tool
│   └── guides/[slug]/page.tsx    # One file per guide
├── components/
│   ├── shared/
│   │   ├── ToolPageLayout.tsx    # Enforced layout for every tool page
│   │   ├── GuidePageLayout.tsx   # Enforced layout for every guide page
│   │   ├── Header.tsx
│   │   ├── Footer.tsx            # Dynamically lists all tools from constants
│   │   ├── ToolIcon.tsx          # SVG icon lookup by tool slug / category
│   │   ├── ToolFaq.tsx           # Accordion FAQ (always rendered by ToolPageLayout)
│   │   ├── RelatedTools.tsx
│   │   └── FileDropzone.tsx
│   └── tools/
│       ├── JsonFormatter.tsx     # "use client" — interactive tool component
│       └── PdfMerger.tsx
├── lib/
│   ├── processors/
│   │   ├── pdf.ts                # Pure functions, no React imports
│   │   └── text.ts
│   └── utils/
│       ├── constants.ts          # Single source of truth for all tool + guide metadata
│       ├── structured-data.ts    # JSON-LD generators (FAQPage, SoftwareApplication, HowTo)
│       └── file.ts               # downloadBlob, formatFileSize, etc.
└── hooks/
    └── useFileProcessor.ts
```

### Architecture rules

- **Processors** (`src/lib/processors/`) are pure functions with no React imports. They can be tested in isolation.
- **Tool components** (`src/components/tools/`) are `"use client"` and import processors.
- **Tool pages** (`src/app/tools/[slug]/page.tsx`) export `metadata` and render `<ToolPageLayout>`. Nothing else.
- **All tool metadata** lives in `src/lib/utils/constants.ts` as the single source of truth. The footer, homepage grid, sitemap, and structured data all derive from it.

### Adding a new tool

1. Add an entry to `TOOLS` in `constants.ts` (move it out of `PLANNED_TOOLS`).
2. Add the processor logic to `src/lib/processors/`.
3. Create the interactive component in `src/components/tools/`.
4. Create the page at `src/app/tools/[slug]/page.tsx` — copy either existing tool page as a template.
5. Add an icon to `ToolIcon.tsx` for the new slug.

The FAQ section, related tools, JSON-LD structured data, and breadcrumbs are all handled automatically by `ToolPageLayout`.

---

## Roadmap

The immediate focus is organic search traffic. Advanced features come later once there is a meaningful user base.

### Phase 1 — SEO foundation (current)

- [x] Core site structure — warm orange design, header, footer
- [x] Tool metadata system — single source of truth in `constants.ts`
- [x] JSON-LD structured data — FAQPage, SoftwareApplication, BreadcrumbList, HowTo
- [x] `ToolPageLayout` / `GuidePageLayout` — enforced consistent page structure
- [x] Category colour system
- [x] Tool icons
- [x] Static export to Azure Static Web Apps

### Phase 2 — Traffic (next)

The tools below are ordered by estimated search volume. Build them in this order.

**PDF tools** (highest search volume of any file category)
- [ ] Compress PDF
- [ ] Split PDF
- [ ] PDF to Word
- [ ] Image to PDF
- [ ] PDF to Image (PNG / JPG)
- [ ] Word to PDF
- [ ] Rotate PDF
- [ ] PDF to Excel
- [ ] Protect PDF / Unlock PDF
- [ ] Watermark PDF
- [ ] Remove PDF pages

**Image tools**
- [ ] Compress Image
- [ ] Convert Image (PNG / JPG / WebP / AVIF)
- [ ] Resize Image
- [ ] Crop Image
- [ ] Rotate / Flip Image
- [ ] Remove Background (AI, runs in browser via ONNX)
- [ ] ICO / Favicon Converter
- [ ] Strip EXIF Metadata
- [ ] SVG Optimizer

**Developer tools**
- [ ] URL Encode / Decode
- [ ] Regex Tester
- [ ] Diff Checker
- [ ] JWT Decoder
- [ ] Hash Generator (MD5 / SHA-256 / SHA-512)
- [ ] UUID Generator
- [ ] Timestamp Converter
- [ ] Color Converter (HEX / RGB / HSL)
- [ ] Markdown Preview
- [ ] HTML Formatter
- [ ] CSS Minifier
- [ ] YAML to JSON
- [ ] JSON to CSV / XML
- [ ] CSV to JSON
- [ ] XML Formatter
- [ ] Base64 Encode / Decode

**Text tools**
- [ ] Word Counter
- [ ] Case Converter (camelCase, snake_case, Title Case, …)
- [ ] Lorem Ipsum Generator
- [ ] Remove Duplicate Lines
- [ ] Line Sorter
- [ ] Markdown to HTML
- [ ] CSV Viewer
- [ ] Excel to CSV / JSON

**Archive tools**
- [ ] Create ZIP
- [ ] Extract ZIP

**Media tools**
- [ ] Video to GIF
- [ ] MP4 to MP3
- [ ] Audio Converter (MP3 / WAV / OGG)
- [ ] STL Viewer

### Phase 3 — Discovery

Features that improve how users find and return to tools.

- [ ] Sitewide search bar — instant filter across all tools
- [ ] "Recently used" strip on homepage — stored in localStorage
- [ ] Format info pages (`/formats/pdf`, `/formats/webp`, …) — rank for "what is X" queries and funnel into tools
- [ ] Tool comparison pages (`/vs/filefolks-vs-ilovepdf`, …) — targets users actively evaluating options
- [ ] Guides for each major tool — HowTo JSON-LD generates rich results in Google
- [ ] Progressive Web App (PWA) — installable, increases return visits

### Phase 4 — Advanced features

Higher-complexity tools and features that require more processing power or a user account.

**Standard tier**
- One file at a time
- 50 MB file size limit
- Basic settings per tool

**Advanced tier**
- Batch processing — multiple files in one go
- Higher file size limits
- Advanced settings (quality, DPI, compression level)
- Saved presets per tool
- API access

**Advanced-only tools**
- [ ] OCR — extract text from scanned PDFs and images (Tesseract WASM)
- [ ] AI background removal at full resolution (ONNX, runs in browser)
- [ ] PDF signing — draw or upload a signature, place it on a page
- [ ] Bulk rename — rename batches of files with a naming pattern, download as ZIP

---

## Development

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # static export to /out
```

No environment variables are required. All processing is client-side.
