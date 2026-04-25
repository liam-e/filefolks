import { useTranslations } from "next-intl";
import type { ToolMeta } from "@/lib/utils/constants";
import { CATEGORIES } from "@/lib/utils/constants";
import { Link } from "@/i18n/navigation";
import {
  generateFaqJsonLd,
  generateToolJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/utils/structured-data";
import { ToolFaq } from "@/components/shared/ToolFaq";
import { RelatedTools } from "@/components/shared/RelatedTools";
import { ToolIcon } from "@/components/shared/ToolIcon";
import { cn } from "@/lib/utils";

interface ToolPageLayoutProps {
  tool: ToolMeta;
  related: ToolMeta[];
  children: React.ReactNode;
}

export function ToolPageLayout({ tool, related, children }: ToolPageLayoutProps) {
  const t = useTranslations("ToolPageLayout");
  const tCategories = useTranslations("Categories");
  const category = CATEGORIES[tool.category];
  const { bg, text } = category.colors;

  const jsonLd = [
    generateToolJsonLd(tool),
    generateFaqJsonLd(tool.faqs),
    generateBreadcrumbJsonLd([
      { name: "Home", url: "https://filefolks.com" },
      { name: category.name, url: `https://filefolks.com/tools/category/${tool.category}` },
      { name: tool.name, url: `https://filefolks.com/tools/${tool.slug}` },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="select-none">/</li>
            <li>
              <Link
                href={`/tools/category/${tool.category}`}
                className="hover:text-foreground transition-colors"
              >
                {tCategories(tool.category)}
              </Link>
            </li>
            <li aria-hidden="true" className="select-none">/</li>
            <li className="text-foreground font-medium truncate" aria-current="page">
              {tool.name}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-4 mb-3">
          <div className={cn("shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5", bg)}>
            <ToolIcon slug={tool.slug} category={tool.category} className={cn("w-5 h-5", text)} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold leading-tight">{tool.name}</h1>
            <p className="text-muted-foreground mt-1">{tool.longDescription}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8 pl-15">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Tool component */}
        {children}

        <ToolFaq
          faqs={tool.faqs}
          toolName={tool.name}
          title={t("faqTitle", { toolName: tool.name })}
        />
        <RelatedTools tools={related} title={t("relatedTitle")} />
      </div>
    </>
  );
}
