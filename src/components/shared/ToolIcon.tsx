interface SvgProps {
  className?: string;
}

function Svg({ className, children }: SvgProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

// ── Tool-specific icons ────────────────────────────────────────

function PdfMergeIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      {/* Two document sheets */}
      <path d="M4 6h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
      <path d="M8 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
      {/* Merge lines */}
      <line x1="6" y1="12" x2="11" y2="12" />
      <line x1="6" y1="15" x2="11" y2="15" />
    </Svg>
  );
}

function JsonFormatterIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      {/* Curly braces */}
      <path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1" />
      <path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1" />
    </Svg>
  );
}

function CompressPdfIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      {/* Two chevrons pointing toward each other = compress */}
      <polyline points="9 11 12 14 15 11" />
      <polyline points="9 17 12 14 15 17" />
    </Svg>
  );
}

function CompressImageIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5.09-5.09a2 2 0 0 0-2.82 0L6 17" />
      <polyline points="9 21 12 18 15 21" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </Svg>
  );
}

function ImageConvertIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <rect x="2" y="3" width="9" height="9" rx="1.5" />
      <circle cx="5.5" cy="5.5" r="1" />
      <path d="m11 11-2-2 2-2" />
      <rect x="13" y="12" width="9" height="9" rx="1.5" />
      <path d="m13 14 2-2-2-2" />
    </Svg>
  );
}

function SplitPdfIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="4" y1="13" x2="20" y2="13" strokeDasharray="2 2" />
      <polyline points="8 10 4 13 8 16" />
      <polyline points="16 10 20 13 16 16" />
    </Svg>
  );
}

function Base64Icon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1" />
      <path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1" />
      <line x1="12" y1="9" x2="12" y2="15" />
      <polyline points="9 12 12 9 15 12" />
    </Svg>
  );
}

function ImageToPdfIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      {/* image frame */}
      <rect x="2" y="2" width="13" height="13" rx="2" />
      <circle cx="6" cy="6" r="1.5" />
      <path d="m15 11-3.5-3.5a1.5 1.5 0 0 0-2.1 0L4 13" />
      {/* arrow into document */}
      <path d="M19 8v8a2 2 0 0 1-2 2H7" />
      <polyline points="16 5 19 8 22 5" />
    </Svg>
  );
}

function PdfRotateIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 13a3 3 0 1 0 6 0" />
      <polyline points="15 11 15 13 13 13" />
    </Svg>
  );
}

function ImageResizeIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </Svg>
  );
}

function ImageCropIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
      <path d="M1 6.13l15-.13a2 2 0 0 1 2 2v15" />
    </Svg>
  );
}

function UrlEncodeIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  );
}

function JwtDecoderIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

function UuidGeneratorIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <rect x="2" y="8" width="20" height="8" rx="2" />
      <line x1="6" y1="12" x2="6" y2="12" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="12" x2="14" y2="12" />
      <line x1="18" y1="12" x2="18" y2="12" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function HashGeneratorIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </Svg>
  );
}

// ── Category fallback icons ────────────────────────────────────

function PdfCategoryIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </Svg>
  );
}

function ImageCategoryIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
    </Svg>
  );
}

function DeveloperCategoryIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </Svg>
  );
}

function TextCategoryIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="15" y1="12" x2="3" y2="12" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </Svg>
  );
}

function MediaCategoryIcon({ className }: SvgProps) {
  return (
    <Svg className={className}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </Svg>
  );
}

// ── Lookup maps ────────────────────────────────────────────────

type IconComponent = (props: SvgProps) => React.ReactElement;

const TOOL_ICONS: Record<string, IconComponent> = {
  "pdf-merge": PdfMergeIcon,
  "compress-pdf": CompressPdfIcon,
  "split-pdf": SplitPdfIcon,
  "image-to-pdf": ImageToPdfIcon,
  "pdf-rotate": PdfRotateIcon,
  "json-formatter": JsonFormatterIcon,
  "compress-image": CompressImageIcon,
  "image-convert": ImageConvertIcon,
  "image-resize": ImageResizeIcon,
  "image-crop": ImageCropIcon,
  "base64-encode-decode": Base64Icon,
  "url-encode-decode": UrlEncodeIcon,
  "jwt-decoder": JwtDecoderIcon,
  "uuid-generator": UuidGeneratorIcon,
  "hash-generator": HashGeneratorIcon,
};

const CATEGORY_ICONS: Record<string, IconComponent> = {
  pdf: PdfCategoryIcon,
  image: ImageCategoryIcon,
  developer: DeveloperCategoryIcon,
  text: TextCategoryIcon,
  media: MediaCategoryIcon,
};

// ── Public component ───────────────────────────────────────────

interface ToolIconProps {
  slug: string;
  category: string;
  className?: string;
}

export function ToolIcon({ slug, category, className }: ToolIconProps) {
  const Icon = TOOL_ICONS[slug] ?? CATEGORY_ICONS[category];
  if (!Icon) return null;
  return <Icon className={className} />;
}
