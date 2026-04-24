# CLAUDE.md — FileFolks project context

## Project overview
FileFolks (filefolks.com) is a privacy-first suite of browser-based file and
developer tools. All file processing happens client-side using WebAssembly and
browser APIs. No files are ever uploaded to a server.

## Tech stack
- Next.js 15 (App Router, static export)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- pdf-lib, browser-image-compression for file processing
- Deployed to Azure Static Web Apps

## Architecture rules
- Processors in src/lib/processors/ are pure functions with NO React imports
- Components in src/components/tools/ are "use client" and import processors
- Each tool page in src/app/tools/[slug]/page.tsx is a thin wrapper that
  exports metadata and renders the tool component
- Tool metadata lives in src/lib/utils/constants.ts as the single source of truth

## Code style
- No em dashes in copy
- Brief, direct prose in UI text
- Prefer explicit types over inference for function signatures
- Use async/await, never raw Promises with .then()

## File naming
- Components: PascalCase (PdfMerger.tsx)
- Utilities/processors: camelCase (pdf.ts, file.ts)
- Pages: kebab-case directories (pdf-merge/page.tsx)