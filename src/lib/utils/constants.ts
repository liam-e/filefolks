// src/lib/utils/constants.ts

// ─── Categories ────────────────────────────────────────────────

export type ToolCategory = "pdf" | "image" | "developer" | "text" | "media";

export interface CategoryColors {
  /** Icon background */
  bg: string;
  /** Icon foreground / text */
  text: string;
  /** Small badge pill */
  badge: string;
}

export interface CategoryMeta {
  slug: ToolCategory;
  name: string;
  description: string;
  /** Meta description for the /tools/[category] listing page */
  metaDescription: string;
  icon: string;
  colors: CategoryColors;
  /**
   * Controls the display order of category sections on the home page.
   * Lower = shown earlier. Update this as analytics show which categories
   * attract the most users.
   */
  displayOrder: number;
}

export const CATEGORIES: Record<ToolCategory, CategoryMeta> = {
  pdf: {
    slug: "pdf",
    name: "PDF tools",
    description: "Merge, split, compress, and manipulate PDF files",
    metaDescription:
        "Free online PDF tools that run in your browser. Merge, split, compress, and convert PDFs without uploading your files.",
    icon: "/icons/category-pdf.svg",
    colors: { bg: "bg-rose-50", text: "text-rose-600", badge: "bg-rose-100 text-rose-700" },
    displayOrder: 1,
  },
  image: {
    slug: "image",
    name: "Image tools",
    description: "Convert, compress, resize, and transform images",
    metaDescription:
        "Free browser-based image tools. Convert between PNG, JPG, WebP, and AVIF. Compress and resize images privately.",
    icon: "/icons/category-image.svg",
    colors: { bg: "bg-violet-50", text: "text-violet-600", badge: "bg-violet-100 text-violet-700" },
    displayOrder: 2,
  },
  developer: {
    slug: "developer",
    name: "Developer tools",
    description: "JSON, Base64, JWT, hashing, and encoding utilities",
    metaDescription:
        "Free developer utilities that run locally. Format JSON, decode JWTs, generate hashes, encode Base64, and more.",
    icon: "/icons/category-developer.svg",
    colors: { bg: "bg-sky-50", text: "text-sky-600", badge: "bg-sky-100 text-sky-700" },
    displayOrder: 3,
  },
  text: {
    slug: "text",
    name: "Text tools",
    description: "Format, compare, count, and transform text",
    metaDescription:
        "Free text manipulation tools. Word counter, diff checker, case converter, and text formatting utilities.",
    icon: "/icons/category-text.svg",
    colors: { bg: "bg-amber-50", text: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
    displayOrder: 4,
  },
  media: {
    slug: "media",
    name: "Media tools",
    description: "Convert and compress audio and video files",
    metaDescription:
        "Free browser-based media tools. Convert video and audio formats, extract audio from video, and compress media files.",
    icon: "/icons/category-media.svg",
    colors: { bg: "bg-emerald-50", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
    displayOrder: 5,
  },
};

// ─── Tags ──────────────────────────────────────────────────────

/**
 * Tags are cross-cutting labels that span categories.
 * A PDF tool and an image tool can both be tagged "compress".
 * Tags power the tag-based browsing UI and internal linking.
 */
export type ToolTag =
    | "compress"
    | "convert"
    | "merge"
    | "split"
    | "resize"
    | "format"
    | "encode"
    | "decode"
    | "validate"
    | "generate"
    | "compare"
    | "extract"
    | "privacy"
    | "batch"
    | "no-upload";

export const TAG_META: Record<ToolTag, { label: string; description: string }> = {
  compress: { label: "Compress", description: "Reduce file size" },
  convert: { label: "Convert", description: "Change file format" },
  merge: { label: "Merge", description: "Combine multiple files" },
  split: { label: "Split", description: "Separate into parts" },
  resize: { label: "Resize", description: "Change dimensions" },
  format: { label: "Format", description: "Beautify or restructure" },
  encode: { label: "Encode", description: "Encode data" },
  decode: { label: "Decode", description: "Decode data" },
  validate: { label: "Validate", description: "Check correctness" },
  generate: { label: "Generate", description: "Create new data" },
  compare: { label: "Compare", description: "Find differences" },
  extract: { label: "Extract", description: "Pull out content" },
  privacy: { label: "Privacy", description: "Extra privacy features" },
  batch: { label: "Batch", description: "Process multiple files" },
  "no-upload": { label: "No upload", description: "Files stay on your device" },
};

// ─── FAQ ───────────────────────────────────────────────────────

export interface FaqItem {
  question: string;
  answer: string;
}

// ─── Instructional content ─────────────────────────────────────

export interface InstructionalStep {
  title: string;
  /** Markdown-compatible body text */
  body: string;
  /** Optional image path or component key for illustration */
  image?: string;
  /** If true, this step describes something the user does on their
   *  own computer/hardware rather than inside the FileFolks tool */
  isOffTool?: boolean;
}

export interface InstructionalGuide {
  /** URL slug: /guides/[slug] */
  slug: string;
  title: string;
  description: string;
  /** The tool this guide relates to (for cross-linking) */
  relatedToolSlug: string;
  steps: InstructionalStep[];
}

// ─── Tool metadata ─────────────────────────────────────────────

export interface ToolMeta {
  /** URL slug: /tools/[slug] */
  slug: string;
  /** Display name */
  name: string;
  /** One-line description for cards and listings */
  description: string;
  /** Longer description for the tool page hero. Supports basic markdown. */
  longDescription: string;

  // ── Taxonomy ──
  category: ToolCategory;
  tags: ToolTag[];

  /**
   * Estimated search traffic rank. Lower = more popular.
   * Used to sort the tools grid on the homepage.
   * Set based on keyword search volume / expected organic traffic.
   */
  popularity: number;

  // ── SEO ──
  /** Page <title> (under 60 chars) */
  seoTitle: string;
  /** Meta description (under 155 chars) */
  seoDescription: string;
  /**
   * Primary keyword phrases this tool should rank for.
   * Used in: meta keywords tag, JSON-LD, internal link anchor text,
   * and as guidance for writing page copy.
   * Order matters — first keyword is the primary target.
   */
  keywords: string[];
  /**
   * Long-tail search queries people might type.
   * These inform the FAQ section and page copy.
   * Example: "how to merge pdf files without uploading"
   */
  searchQueries: string[];

  // ── FAQ ──
  /**
   * FAQs are defined per-tool in the metadata.
   * They render on the page AND are output as FAQPage JSON-LD
   * structured data, which can produce rich results in Google.
   */
  faqs: FaqItem[];

  // ── Instructional guide link ──
  /** If this tool has an associated guide, reference its slug here */
  guideSlug?: string;

  // ── Assets ──
  icon: string;
  ogImage?: string;
}

// ─── Example tool definition ───────────────────────────────────

export const TOOLS: ToolMeta[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON data",
    longDescription:
        "Paste or drop a JSON file to format, validate, and inspect it. " +
        "See key counts, nesting depth, and file size at a glance. " +
        "Everything runs in your browser — nothing is uploaded.",
    category: "developer",
    tags: ["format", "validate", "no-upload"],
    popularity: 2,
    seoTitle: "JSON Formatter and Validator — Free, Private, No Upload | FileFolks",
    seoDescription:
        "Format, validate, and minify JSON online. Runs entirely in your browser. Your data never leaves your device.",
    keywords: [
      "json formatter",
      "json validator",
      "json beautifier",
      "format json online",
      "json formatter online free",
      "json lint",
      "minify json",
    ],
    searchQueries: [
      "how to format json online",
      "json formatter that doesn't upload my data",
      "validate json without sending to server",
      "beautify json free online",
      "minify json online",
    ],
    faqs: [
      {
        question: "Is my JSON data sent to a server?",
        answer:
            "No. All processing happens in your browser using JavaScript. " +
            "Your data never leaves your device. You can verify this by " +
            "opening your browser's Network tab while using the tool.",
      },
      {
        question: "What is the maximum JSON size I can format?",
        answer:
            "There is no hard limit, but very large files (over 50 MB) may " +
            "cause your browser tab to slow down. For best performance, we " +
            "recommend files under 10 MB.",
      },
      {
        question: "Can I format JSON with comments (JSONC)?",
        answer:
            "Standard JSON does not support comments. If your input contains " +
            "comments, the validator will report a parse error. You can strip " +
            "comments manually before formatting.",
      },
      {
        question: "What is the difference between formatting and minifying?",
        answer:
            "Formatting adds indentation and line breaks to make JSON human-readable. " +
            "Minifying removes all unnecessary whitespace to reduce file size, which " +
            "is useful when JSON will be sent over a network.",
      },
    ],
    icon: "/icons/json-formatter.svg",
  },

  {
    slug: "pdf-merge",
    name: "Merge PDF",
    description: "Combine multiple PDF files into one document",
    longDescription:
        "Drag and drop your PDF files to merge them into a single document. " +
        "Reorder pages by dragging. Everything happens in your browser — " +
        "your files never leave your device.",
    category: "pdf",
    tags: ["merge", "batch", "no-upload"],
    popularity: 1,
    seoTitle: "Merge PDF Files Online — Free, Private, No Upload | FileFolks",
    seoDescription:
        "Combine multiple PDFs into one file. Runs in your browser with no upload. Drag, drop, reorder, and download.",
    keywords: [
      "merge pdf",
      "combine pdf",
      "join pdf files",
      "pdf merger online free",
      "merge pdf without uploading",
      "combine pdf files online",
    ],
    searchQueries: [
      "how to merge pdf files",
      "combine pdf files without uploading",
      "merge pdf online free no sign up",
      "join multiple pdfs into one",
      "pdf merger that doesn't upload files",
    ],
    faqs: [
      {
        question: "Are my PDF files uploaded to a server?",
        answer:
            "No. All merging happens locally in your browser using the pdf-lib " +
            "library. Your files never leave your device.",
      },
      {
        question: "Is there a limit on the number of PDFs I can merge?",
        answer:
            "There is no fixed limit. The practical limit depends on your " +
            "device's available memory. Most users can merge 50+ files without issues.",
      },
      {
        question: "Can I reorder pages before merging?",
        answer:
            "Yes. After dropping your files, you can drag them into the order " +
            "you want. The merged PDF will follow this order.",
      },
      {
        question: "Will the merged PDF keep bookmarks and links?",
        answer:
            "Basic page content, images, and text are preserved. Interactive " +
            "elements like bookmarks and form fields may not carry over in all cases.",
      },
    ],
    guideSlug: "how-to-merge-pdfs-on-any-device",
    icon: "/icons/pdf-merge.svg",
  },

  {
    slug: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce PDF file size while preserving content",
    longDescription:
        "Drop a PDF to reduce its file size. The tool strips embedded metadata and " +
        "optimizes the internal structure entirely in your browser. " +
        "Your file is never uploaded.",
    category: "pdf",
    tags: ["compress", "no-upload"],
    popularity: 3,
    seoTitle: "Compress PDF Online — Free, Private, No Upload | FileFolks",
    seoDescription:
        "Reduce PDF file size in your browser. No upload needed. Strips metadata and optimizes internal structure for smaller files.",
    keywords: [
      "compress pdf",
      "reduce pdf size",
      "pdf compressor online free",
      "shrink pdf file size",
      "compress pdf without uploading",
      "pdf optimizer",
    ],
    searchQueries: [
      "how to compress a pdf file",
      "reduce pdf file size online free",
      "compress pdf without uploading to server",
      "make pdf smaller online",
      "pdf file too large how to reduce",
    ],
    faqs: [
      {
        question: "Is my PDF uploaded to a server?",
        answer:
            "No. All compression happens in your browser using the pdf-lib library. " +
            "Your file never leaves your device. You can confirm this by watching " +
            "your browser's Network tab while using the tool.",
      },
      {
        question: "How much will my PDF shrink?",
        answer:
            "The tool strips embedded metadata and optimizes the internal object structure. " +
            "Savings vary by file: PDFs with redundant metadata or an unoptimized " +
            "internal layout can see 10-40% reduction. PDFs that are already optimized " +
            "or consist mostly of compressed images will see smaller gains.",
      },
      {
        question: "Will the content of my PDF change?",
        answer:
            "No. Only invisible metadata (author, creator, timestamps) and internal " +
            "structural overhead are removed. Page content, text, images, and layout " +
            "are preserved exactly.",
      },
      {
        question: "What if the compressed file is larger than the original?",
        answer:
            "This can happen if the original PDF was already tightly optimized. " +
            "The tool will still let you download both versions, but we recommend " +
            "keeping your original in that case.",
      },
    ],
    icon: "/icons/compress-pdf.svg",
  },

  {
    slug: "compress-image",
    name: "Compress Image",
    description: "Reduce image file size with minimal quality loss",
    longDescription:
      "Drop a PNG, JPG, or WebP image to compress it. File size is reduced while preserving visual quality — everything runs in your browser. Nothing is uploaded.",
    category: "image",
    tags: ["compress", "no-upload"],
    popularity: 4,
    seoTitle: "Compress Image Online — Free, Private, No Upload | FileFolks",
    seoDescription:
      "Reduce image file size in your browser. PNG, JPG, WebP. No upload. Fast and private.",
    keywords: ["compress image", "reduce image size", "image compressor online free", "compress jpg online", "compress png online", "shrink image file size"],
    searchQueries: ["how to compress image online free", "reduce image file size without losing quality", "compress png without losing quality online"],
    faqs: [
      { question: "Are my images uploaded to a server?", answer: "No. Compression runs entirely in your browser using JavaScript. Your images never leave your device." },
      { question: "Which formats are supported?", answer: "PNG, JPG, and WebP. The output format matches your input file." },
      { question: "How much will the file shrink?", answer: "Savings vary by image. Photographs typically compress 40-70%. Images that are already heavily compressed will see smaller gains." },
      { question: "Will compression affect image quality?", answer: "The tool targets a maximum output size of 1 MB while preserving as much quality as possible. For most photos the difference is imperceptible." },
    ],
    icon: "/icons/compress-image.svg",
  },

  {
    slug: "image-convert",
    name: "Convert Image",
    description: "Convert images between PNG, JPG, and WebP",
    longDescription:
      "Drop an image to convert it to PNG, JPG, or WebP. Uses your browser's built-in Canvas API. No upload, no account required.",
    category: "image",
    tags: ["convert", "no-upload"],
    popularity: 5,
    seoTitle: "Convert Image Online — PNG to JPG, WebP and more | FileFolks",
    seoDescription:
      "Convert PNG to JPG, JPG to WebP, and more. Free, private, runs in your browser. No upload required.",
    keywords: ["convert image", "png to jpg", "jpg to png", "convert png to jpg online free", "image converter online", "jpg to webp", "png to webp"],
    searchQueries: ["how to convert png to jpg online free", "convert image format without uploading", "png to jpg no upload"],
    faqs: [
      { question: "Are my images uploaded?", answer: "No. Conversion uses the browser's Canvas API entirely on your device. Nothing is sent to a server." },
      { question: "What happens to transparency when converting to JPG?", answer: "JPG does not support transparency. Any transparent areas are filled with a white background automatically." },
      { question: "Is there quality loss when converting?", answer: "Converting to PNG is lossless. Converting to JPG or WebP applies light compression (92% quality by default), which is visually indistinguishable for most images." },
      { question: "Can I convert AVIF or GIF files?", answer: "Currently the tool supports PNG, JPG, and WebP input and output. AVIF and GIF support may be added in future." },
    ],
    icon: "/icons/image-convert.svg",
  },

  {
    slug: "split-pdf",
    name: "Split PDF",
    description: "Extract a range of pages from a PDF into a new file",
    longDescription:
      "Drop a PDF, choose a page range, and download just those pages as a new document. Powered by pdf-lib in your browser. No upload required.",
    category: "pdf",
    tags: ["split", "extract", "no-upload"],
    popularity: 6,
    seoTitle: "Split PDF Online — Free, Private, No Upload | FileFolks",
    seoDescription:
      "Extract pages from a PDF in your browser. Select a range and download instantly. No upload.",
    keywords: ["split pdf", "extract pages from pdf", "pdf splitter online free", "split pdf without uploading", "pdf page extractor online"],
    searchQueries: ["how to split a pdf online free", "extract pages from pdf without uploading", "split pdf file into parts online"],
    faqs: [
      { question: "Is my PDF uploaded to a server?", answer: "No. All splitting happens in your browser using the pdf-lib library. Your file never leaves your device." },
      { question: "Can I extract non-consecutive pages?", answer: "Currently the tool extracts a continuous range. For non-consecutive pages, extract each range separately and merge the results with the Merge PDF tool." },
      { question: "Will the extracted pages keep their content?", answer: "Yes. All text, images, and layout are preserved exactly as in the original." },
      { question: "What if my PDF is password-protected?", answer: "Password-protected PDFs cannot be processed. Remove the password first using a PDF unlock tool, then split the file." },
    ],
    icon: "/icons/split-pdf.svg",
  },

  {
    slug: "base64-encode-decode",
    name: "Base64 Encode / Decode",
    description: "Encode text or files to Base64, or decode Base64 back to text",
    longDescription:
      "Paste text or load a file to encode it as Base64, or paste a Base64 string to decode it. All processing happens locally in your browser.",
    category: "developer",
    tags: ["encode", "decode", "no-upload"],
    popularity: 7,
    seoTitle: "Base64 Encode & Decode Online — Free, Private | FileFolks",
    seoDescription:
      "Encode text or files to Base64, or decode Base64 to text. Runs in your browser. No upload required.",
    keywords: ["base64 encode", "base64 decode", "base64 encoder decoder online", "encode to base64 online", "decode base64 string online", "base64 converter free"],
    searchQueries: ["how to encode text to base64 online", "decode base64 string to text online", "base64 encode file online free"],
    faqs: [
      { question: "Is my data uploaded to a server?", answer: "No. Base64 encoding and decoding are pure JavaScript operations that run entirely in your browser." },
      { question: "What is Base64 used for?", answer: "Base64 is used to safely transmit binary data as text — in emails, data URLs, API payloads, and configuration files." },
      { question: "Is there a size limit?", answer: "There is no hard limit, but very large files (over 10 MB) may slow down your browser tab. For files, the output Base64 string will be roughly 33% larger than the input." },
      { question: "Does Base64 encrypt my data?", answer: "No. Base64 is an encoding scheme, not encryption. Anyone with the Base64 string can decode it instantly. Do not use it to protect sensitive data." },
    ],
    icon: "/icons/base64-encode-decode.svg",
  },

  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    description: "Convert one or more images into a single PDF document",
    longDescription:
      "Drop PNG, JPG, or WebP images and download them combined into a single PDF. Reorder pages by dragging. Everything runs in your browser — nothing is uploaded.",
    category: "pdf",
    tags: ["convert", "merge", "no-upload"],
    popularity: 8,
    seoTitle: "Image to PDF Online — Free, Private, No Upload | FileFolks",
    seoDescription:
      "Convert JPG, PNG, or WebP images to a PDF in your browser. Reorder pages, then download. No upload required.",
    keywords: ["image to pdf", "jpg to pdf", "png to pdf", "convert image to pdf online free", "photos to pdf", "jpg to pdf no upload"],
    searchQueries: ["how to convert jpg to pdf online free", "combine images into pdf without uploading", "png to pdf converter online"],
    faqs: [
      { question: "Are my images uploaded to a server?", answer: "No. All processing uses pdf-lib in your browser. Your images never leave your device." },
      { question: "Which image formats are supported?", answer: "PNG, JPG, and WebP. Each image becomes one page in the output PDF." },
      { question: "Can I control the page order?", answer: "Yes. After adding your images, drag them into the order you want. The PDF pages will follow this order." },
      { question: "What size will the PDF pages be?", answer: "Each page matches the pixel dimensions of the source image. For very large images the PDF file size may be significant." },
    ],
    icon: "/icons/image-to-pdf.svg",
  },

  {
    slug: "pdf-rotate",
    name: "Rotate PDF",
    description: "Rotate pages in a PDF by 90°, 180°, or 270°",
    longDescription:
      "Drop a PDF and choose a rotation amount. All pages are rotated and the result downloads instantly — entirely in your browser.",
    category: "pdf",
    tags: ["no-upload"],
    popularity: 9,
    seoTitle: "Rotate PDF Online — Free, Private, No Upload | FileFolks",
    seoDescription:
      "Rotate all pages in a PDF by 90°, 180°, or 270°. Runs in your browser. No upload required.",
    keywords: ["rotate pdf", "rotate pdf pages online", "pdf rotator online free", "rotate pdf without uploading", "turn pdf pages"],
    searchQueries: ["how to rotate a pdf online free", "rotate pdf pages without uploading", "fix upside down pdf online"],
    faqs: [
      { question: "Is my PDF uploaded to a server?", answer: "No. Rotation happens in your browser using pdf-lib. Your file never leaves your device." },
      { question: "Can I rotate only specific pages?", answer: "Currently the tool rotates all pages by the same amount. Per-page rotation may be added in a future update." },
      { question: "Which direction is 90° right?", answer: "90° right rotates each page clockwise. 90° left rotates counter-clockwise. 180° flips pages upside down." },
      { question: "Will the text and images be affected?", answer: "No. Only the viewing orientation of each page changes. All content is preserved exactly." },
    ],
    icon: "/icons/pdf-rotate.svg",
  },

  {
    slug: "image-resize",
    name: "Resize Image",
    description: "Resize images to exact pixel dimensions or a percentage",
    longDescription:
      "Drop an image, enter target dimensions or a percentage scale, and download the resized result. Aspect ratio lock keeps your image proportional. Runs entirely in your browser.",
    category: "image",
    tags: ["resize", "no-upload"],
    popularity: 10,
    seoTitle: "Resize Image Online — Free, Private, No Upload | FileFolks",
    seoDescription:
      "Resize images to exact pixels or a percentage in your browser. PNG, JPG, WebP. No upload required.",
    keywords: ["resize image", "resize image online free", "image resizer", "resize jpg online", "resize png online", "change image dimensions online"],
    searchQueries: ["how to resize an image online for free", "resize image to specific pixels", "reduce image dimensions without losing quality"],
    faqs: [
      { question: "Are my images uploaded?", answer: "No. Resizing uses the Canvas API in your browser. Nothing is sent to a server." },
      { question: "Will the image quality change?", answer: "PNG output is lossless. JPG and WebP output uses 92% quality, which is visually indistinguishable from the original for most images." },
      { question: "What does the aspect ratio lock do?", answer: "When locked, changing one dimension automatically scales the other to keep the image proportional. Unlock it to set width and height independently." },
      { question: "Can I enlarge an image?", answer: "Yes, you can scale up to 200% using percentage mode. Note that enlarging a raster image reduces sharpness — the pixels are simply stretched." },
    ],
    icon: "/icons/image-resize.svg",
  },

  {
    slug: "image-crop",
    name: "Crop Image",
    description: "Crop images to a custom area or a preset aspect ratio",
    longDescription:
      "Drop an image, adjust the crop region using the visual preview and coordinate inputs, then download the cropped result. All processing stays in your browser.",
    category: "image",
    tags: ["no-upload"],
    popularity: 11,
    seoTitle: "Crop Image Online — Free, Private, No Upload | FileFolks",
    seoDescription:
      "Crop images to any size or aspect ratio in your browser. PNG, JPG, WebP. No upload required.",
    keywords: ["crop image", "crop image online free", "image cropper online", "crop jpg online", "crop png to square", "crop image to size"],
    searchQueries: ["how to crop an image online free", "crop image to specific dimensions", "crop photo to square online"],
    faqs: [
      { question: "Are my images uploaded?", answer: "No. Cropping uses the Canvas API in your browser. Nothing is sent to a server." },
      { question: "What aspect ratio presets are available?", answer: "Free (no constraint), 1:1 (square), 4:3, 16:9, and 3:2. The preset centres the crop region within the image." },
      { question: "Can I enter exact pixel coordinates?", answer: "Yes. Use the X, Y, Width, and Height inputs for precise control. The visual preview updates in real time." },
      { question: "What output format does the tool use?", answer: "The output format matches the input — PNG for PNG files, JPG for JPG files, and WebP for WebP files." },
    ],
    icon: "/icons/image-crop.svg",
  },

  {
    slug: "url-encode-decode",
    name: "URL Encode / Decode",
    description: "Encode and decode URL-safe strings and query parameters",
    longDescription:
      "Paste any text to URL-encode it for safe use in a browser address bar or API request, or paste a percent-encoded string to decode it back. Everything runs locally in your browser.",
    category: "developer",
    tags: ["encode", "decode", "no-upload"],
    popularity: 12,
    seoTitle: "URL Encode & Decode Online — Free, Private | FileFolks",
    seoDescription:
      "Encode or decode URLs and query strings instantly in your browser. No upload or account needed.",
    keywords: ["url encode", "url decode", "url encoder online", "percent encode", "url decode online", "encodeURIComponent online", "url encoding tool"],
    searchQueries: ["url encode online free", "decode url encoded string online", "percent encode url online"],
    faqs: [
      { question: "Is my data uploaded?", answer: "No. URL encoding and decoding are pure JavaScript operations that run entirely in your browser." },
      { question: "What is URL encoding?", answer: "URL encoding (percent-encoding) replaces special characters with a percent sign followed by two hex digits. For example, a space becomes %20 and an ampersand becomes %26." },
      { question: "What is the difference between encodeURIComponent and encodeURI?", answer: "This tool uses encodeURIComponent, which encodes everything except A–Z a–z 0–9 - _ . ! ~ * ' ( ). Use it for individual query parameter values. encodeURI preserves characters valid in a complete URL, such as slashes and colons." },
      { question: "Can I decode a full URL?", answer: "Yes. Paste the full percent-encoded URL into the Decode tab and the tool will decode all percent-sequences back to readable characters." },
    ],
    icon: "/icons/url-encode-decode.svg",
  },

  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and inspect JSON Web Token headers and payloads",
    longDescription:
      "Paste a JSON Web Token to instantly see its decoded header, payload claims, and expiry date. The token never leaves your browser — no server call is made.",
    category: "developer",
    tags: ["decode", "no-upload"],
    popularity: 13,
    seoTitle: "JWT Decoder Online — Inspect Token Claims | FileFolks",
    seoDescription:
      "Decode and inspect a JWT header and payload instantly in your browser. Private and free.",
    keywords: ["jwt decoder", "jwt decode online", "jwt inspector", "decode jwt token", "jwt parser online", "json web token decoder free"],
    searchQueries: ["how to decode jwt token online", "jwt payload decoder free", "inspect jwt claims online"],
    faqs: [
      { question: "Is my JWT sent to a server?", answer: "No. Decoding a JWT is a Base64 operation that runs entirely in your browser. Your token is never transmitted." },
      { question: "Does this tool verify the signature?", answer: "No. Signature verification requires your secret or public key, which you should never share with a third-party tool. This decoder shows the header and payload claims only." },
      { question: "What is a JWT?", answer: "A JSON Web Token (JWT) is a compact, URL-safe token made of three Base64-encoded parts separated by dots: a header (algorithm), a payload (claims), and a signature." },
      { question: "Can I see when the token expires?", answer: "Yes. If the payload contains an exp claim, the decoder shows it as a human-readable date and indicates whether the token is currently expired." },
    ],
    icon: "/icons/jwt-decoder.svg",
  },

  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate v4 UUIDs in bulk, with clipboard copy and download",
    longDescription:
      "Generate one or more RFC 4122 version 4 UUIDs using the browser's cryptographically secure random number generator. Copy individually, copy all, or download as a text file.",
    category: "developer",
    tags: ["generate", "no-upload"],
    popularity: 14,
    seoTitle: "UUID Generator Online — Generate v4 UUIDs Free | FileFolks",
    seoDescription:
      "Generate cryptographically secure v4 UUIDs in your browser. Bulk generate, copy, and download. Free and private.",
    keywords: ["uuid generator", "generate uuid online", "uuid v4 generator", "random uuid generator", "bulk uuid generator", "unique id generator online"],
    searchQueries: ["generate uuid online free", "uuid v4 generator bulk", "random uuid creator online"],
    faqs: [
      { question: "Are these UUIDs cryptographically secure?", answer: "Yes. The tool uses the browser's built-in crypto.randomUUID() API, which uses a cryptographically secure pseudorandom number generator (CSPRNG)." },
      { question: "What is a UUID v4?", answer: "A version 4 UUID is a 128-bit random identifier formatted as 8-4-4-4-12 hex digits separated by hyphens. The version nibble is always 4 and the variant nibble is 8, 9, a, or b." },
      { question: "Can I generate UUIDs in bulk?", answer: "Yes. Set the count to any number between 1 and 100 and click Generate. Use Copy all or Download to get them all at once." },
      { question: "Are the UUIDs unique?", answer: "Yes with overwhelming probability. The chance of a v4 UUID collision is astronomically small — roughly 1 in 5.3 × 10³⁶ for any two random UUIDs." },
    ],
    icon: "/icons/uuid-generator.svg",
  },

  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text or files",
    longDescription:
      "Paste text or drop a file to compute its SHA-1, SHA-256, SHA-384, or SHA-512 hash. Everything runs in your browser using the built-in Web Crypto API. SHA-256 is recommended for security-critical applications.",
    category: "developer",
    tags: ["generate", "encode", "no-upload"],
    popularity: 15,
    seoTitle: "Hash Generator Online — SHA-256, SHA-512, SHA-1 | FileFolks",
    seoDescription:
      "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text or files in your browser. Private and free.",
    keywords: ["hash generator", "sha256 generator online", "sha-512 hash generator", "sha1 hash online", "checksum generator", "file hash checker online"],
    searchQueries: ["sha256 hash generator online free", "generate sha512 hash from text", "file checksum tool online"],
    faqs: [
      { question: "Is my data uploaded?", answer: "No. Hashing uses the Web Crypto API, which runs entirely in your browser. Your text or file is never transmitted." },
      { question: "Which hash algorithm should I use?", answer: "Use SHA-256 or SHA-512 for security-critical work. SHA-1 is deprecated for security use — it is suitable only for non-security checksums. MD5 is not supported as it is cryptographically broken." },
      { question: "Can I hash a file?", answer: "Yes. Switch to File mode, drop or select any file, and the hash is computed from the file's raw bytes." },
      { question: "What is a hash?", answer: "A cryptographic hash is a fixed-length fingerprint of your data. The same input always produces the same hash, but even a one-character change produces a completely different output." },
    ],
    icon: "/icons/hash-generator.svg",
  },

  // ... add more tools following this pattern
];

// ─── Helper functions ──────────────────────────────────────────

/** Get all tools in a given category */
export function getToolsByCategory(category: ToolCategory): ToolMeta[] {
  return TOOLS.filter((t) => t.category === category);
}

/** Get all tools with a given tag */
export function getToolsByTag(tag: ToolTag): ToolMeta[] {
  return TOOLS.filter((t) => t.tags.includes(tag));
}

/** Get a single tool by slug */
export function getToolBySlug(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

/** Get all unique tags that appear across all tools, sorted by frequency */
export function getAllUsedTags(): { tag: ToolTag; count: number }[] {
  const counts = new Map<ToolTag, number>();
  for (const tool of TOOLS) {
    for (const tag of tool.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
}

/** Get related tools (same category or shared tags, excluding self) */
export function getRelatedTools(slug: string, limit = 4): ToolMeta[] {
  const tool = getToolBySlug(slug);
  if (!tool) return [];

  return TOOLS.filter((t) => t.slug !== slug)
      .map((t) => ({
        tool: t,
        score:
            (t.category === tool.category ? 3 : 0) +
            t.tags.filter((tag) => tool.tags.includes(tag)).length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((t) => t.tool);
}

// ─── Planned tools (not yet built) ────────────────────────────
//
// These are the next tools to build, ordered by estimated search traffic.
// When a tool is ready, move it into TOOLS above with full metadata.

export interface PlannedTool {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  /** Lower = higher estimated traffic / build priority */
  priority: number;
}

export const PLANNED_TOOLS: PlannedTool[] = [
  // ── PDF ──
  {
    slug: "split-pdf",
    name: "Split PDF",
    description: "Split a PDF into individual pages or custom ranges",
    category: "pdf",
    priority: 2,
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    description: "Convert a PDF document to an editable Word file",
    category: "pdf",
    priority: 3,
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    description: "Convert one or more images into a single PDF",
    category: "pdf",
    priority: 4,
  },
  {
    slug: "pdf-to-image",
    name: "PDF to Image",
    description: "Extract each PDF page as a PNG or JPG image",
    category: "pdf",
    priority: 5,
  },
  // ── Image ──
  {
    slug: "compress-image",
    name: "Compress Image",
    description: "Reduce image file size with minimal quality loss",
    category: "image",
    priority: 6,
  },
  {
    slug: "image-convert",
    name: "Convert Image",
    description: "Convert images between PNG, JPG, WebP, and AVIF",
    category: "image",
    priority: 7,
  },
  {
    slug: "image-resize",
    name: "Resize Image",
    description: "Resize images to exact pixel dimensions or a percentage",
    category: "image",
    priority: 8,
  },
  // ── Media / Archive ──
  {
    slug: "zip-files",
    name: "Create ZIP",
    description: "Compress multiple files into a ZIP archive",
    category: "media",
    priority: 9,
  },
  {
    slug: "unzip-files",
    name: "Extract ZIP",
    description: "Extract files from a ZIP archive in your browser",
    category: "media",
    priority: 10,
  },
  // ── Developer ──
  {
    slug: "json-to-csv",
    name: "JSON to CSV",
    description: "Convert a JSON array of objects to a CSV file",
    category: "developer",
    priority: 11,
  },
  {
    slug: "csv-to-json",
    name: "CSV to JSON",
    description: "Convert a CSV file to a JSON array of objects",
    category: "developer",
    priority: 12,
  },
  {
    slug: "xml-formatter",
    name: "XML Formatter",
    description: "Format, validate, and inspect XML documents",
    category: "developer",
    priority: 13,
  },
  {
    slug: "base64-encode-decode",
    name: "Base64 Encode / Decode",
    description: "Encode text or files to Base64 and decode it back",
    category: "developer",
    priority: 14,
  },
  // ── Text ──
  {
    slug: "csv-viewer",
    name: "CSV Viewer",
    description: "View, sort, and inspect CSV files as a table",
    category: "text",
    priority: 15,
  },
  {
    slug: "excel-to-csv",
    name: "Excel to CSV",
    description: "Convert an Excel spreadsheet to CSV format",
    category: "text",
    priority: 16,
  },
  {
    slug: "excel-to-json",
    name: "Excel to JSON",
    description: "Convert an Excel spreadsheet to a JSON file",
    category: "text",
    priority: 17,
  },
  {
    slug: "svg-optimizer",
    name: "SVG Optimizer",
    description: "Minify and clean up SVG files to reduce their size",
    category: "image",
    priority: 18,
  },
  {
    slug: "stl-viewer",
    name: "STL Viewer",
    description: "View and inspect 3D STL model files in your browser",
    category: "media",
    priority: 19,
  },

  // ── Developer (high-traffic utilities) ──
  {
    slug: "url-encode-decode",
    name: "URL Encode / Decode",
    description: "Encode and decode URL-safe strings and query parameters",
    category: "developer",
    priority: 20,
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Write, test, and debug regular expressions with live match highlighting",
    category: "developer",
    priority: 21,
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    description: "Compare two blocks of text and highlight the differences",
    category: "developer",
    priority: 22,
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and inspect JSON Web Token headers and payloads",
    category: "developer",
    priority: 23,
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files",
    category: "developer",
    priority: 24,
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate v4 UUIDs in bulk, with clipboard copy and download",
    category: "developer",
    priority: 25,
  },
  {
    slug: "timestamp-converter",
    name: "Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and back",
    category: "developer",
    priority: 26,
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert colors between HEX, RGB, HSL, HSV, and CSS names",
    category: "developer",
    priority: 27,
  },
  {
    slug: "markdown-preview",
    name: "Markdown Preview",
    description: "Write Markdown and preview the rendered HTML in real time",
    category: "developer",
    priority: 28,
  },
  {
    slug: "html-formatter",
    name: "HTML Formatter",
    description: "Beautify or minify HTML markup with configurable indentation",
    category: "developer",
    priority: 29,
  },
  {
    slug: "css-minifier",
    name: "CSS Minifier",
    description: "Minify and compress CSS stylesheets to reduce file size",
    category: "developer",
    priority: 30,
  },
  {
    slug: "yaml-to-json",
    name: "YAML to JSON",
    description: "Convert YAML configuration files to JSON format",
    category: "developer",
    priority: 31,
  },
  {
    slug: "json-to-xml",
    name: "JSON to XML",
    description: "Convert JSON data to XML format",
    category: "developer",
    priority: 32,
  },

  // ── PDF (continuing) ──
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert Word documents (.docx) to PDF",
    category: "pdf",
    priority: 33,
  },
  {
    slug: "pdf-to-excel",
    name: "PDF to Excel",
    description: "Extract tables from a PDF and export them as a spreadsheet",
    category: "pdf",
    priority: 34,
  },
  {
    slug: "pdf-rotate",
    name: "Rotate PDF",
    description: "Rotate individual pages or an entire PDF in any direction",
    category: "pdf",
    priority: 35,
  },
  {
    slug: "pdf-protect",
    name: "Protect PDF",
    description: "Add password protection to a PDF file",
    category: "pdf",
    priority: 36,
  },
  {
    slug: "pdf-unlock",
    name: "Unlock PDF",
    description: "Remove password protection from a PDF you own",
    category: "pdf",
    priority: 37,
  },
  {
    slug: "pdf-watermark",
    name: "Watermark PDF",
    description: "Add a text or image watermark to every page of a PDF",
    category: "pdf",
    priority: 38,
  },
  {
    slug: "pdf-remove-pages",
    name: "Remove PDF Pages",
    description: "Select and delete specific pages from a PDF",
    category: "pdf",
    priority: 39,
  },

  // ── Image (continuing) ──
  {
    slug: "image-crop",
    name: "Crop Image",
    description: "Crop images to a custom area or a preset aspect ratio",
    category: "image",
    priority: 40,
  },
  {
    slug: "image-rotate",
    name: "Rotate / Flip Image",
    description: "Rotate images by 90, 180, or 270 degrees, or flip them",
    category: "image",
    priority: 41,
  },
  {
    slug: "image-metadata",
    name: "Image Metadata Viewer",
    description: "Read and optionally strip EXIF data from photos",
    category: "image",
    priority: 42,
  },
  {
    slug: "ico-converter",
    name: "ICO Converter",
    description: "Convert a PNG or SVG into a .ico favicon file",
    category: "image",
    priority: 43,
  },
  {
    slug: "remove-background",
    name: "Remove Background",
    description: "Remove the background from photos using an AI model running in your browser",
    category: "image",
    priority: 44,
  },

  // ── Text (continuing) ──
  {
    slug: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, sentences, and reading time",
    category: "text",
    priority: 45,
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    description: "Convert text between camelCase, snake_case, UPPER_CASE, Title Case, and more",
    category: "text",
    priority: 46,
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text by word, sentence, or paragraph count",
    category: "text",
    priority: 47,
  },
  {
    slug: "duplicate-line-remover",
    name: "Remove Duplicate Lines",
    description: "Paste text and remove duplicate lines, with optional sorting",
    category: "text",
    priority: 48,
  },
  {
    slug: "markdown-to-html",
    name: "Markdown to HTML",
    description: "Convert Markdown source to clean HTML markup",
    category: "text",
    priority: 49,
  },
  {
    slug: "line-sorter",
    name: "Line Sorter",
    description: "Sort lines of text alphabetically, by length, or randomly",
    category: "text",
    priority: 50,
  },

  // ── Media (continuing) ──
  {
    slug: "video-to-gif",
    name: "Video to GIF",
    description: "Convert a short video clip to an animated GIF in your browser",
    category: "media",
    priority: 51,
  },
  {
    slug: "mp4-to-mp3",
    name: "MP4 to MP3",
    description: "Extract the audio track from an MP4 video as an MP3 file",
    category: "media",
    priority: 52,
  },
  {
    slug: "audio-convert",
    name: "Audio Converter",
    description: "Convert audio files between MP3, WAV, OGG, and FLAC",
    category: "media",
    priority: 53,
  },
];

export const GUIDES: InstructionalGuide[] = [
  {
    slug: "how-to-merge-pdfs-on-any-device",
    title: "How to merge PDFs on any device",
    description:
        "A complete guide to combining PDF files, whether you are on Windows, Mac, Linux, or a phone.",
    relatedToolSlug: "pdf-merge",
    steps: [
      {
        title: "Gather your PDF files",
        body:
            "Before merging, make sure all the PDFs you want to combine are saved " +
            "somewhere you can access them. If you have paper documents, scan them " +
            "first using your phone's built-in scanner or a dedicated scanning app.\n\n" +
            "**On iPhone:** Open the Notes app, tap the camera icon, and choose " +
            "'Scan Documents'. Save the scan as a PDF.\n\n" +
            "**On Android:** Open Google Drive, tap the '+' button, and choose " +
            "'Scan'. The app will save the scan as a PDF to your Drive.",
        isOffTool: true,
      },
      {
        title: "Open the FileFolks PDF Merge tool",
        body:
            "Navigate to [filefolks.com/tools/pdf-merge](https://filefolks.com/tools/pdf-merge). " +
            "No account or sign-up is required.",
        isOffTool: false,
      },
      {
        title: "Add your files",
        body:
            "Drag and drop your PDF files onto the upload area, or click to browse. " +
            "You can add as many files as you need. They will appear as a list below " +
            "the upload area.",
        isOffTool: false,
      },
      {
        title: "Arrange the order",
        body:
            "Drag the files in the list to rearrange them. The merged PDF will " +
            "follow this order from top to bottom.",
        isOffTool: false,
      },
      {
        title: "Merge and download",
        body:
            "Click the 'Merge' button. The merged PDF will be created in your " +
            "browser and a download will start automatically. Your files were " +
            "never uploaded to any server.",
        isOffTool: false,
      },
      {
        title: "Verify the result",
        body:
            "Open the downloaded PDF and check that all pages are present and " +
            "in the correct order. If you need to make changes, simply return " +
            "to the tool and start again.\n\n" +
            "**Tip:** If the merged file is too large, try the " +
            "[PDF Compress tool](/tools/pdf-compress) to reduce its size before sharing.",
        isOffTool: true,
      },
    ],
  },

  // Add more guides as you build more tools
];

export function getGuideBySlug(slug: string): InstructionalGuide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}