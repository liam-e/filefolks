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
  "json-formatter": JsonFormatterIcon,
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
