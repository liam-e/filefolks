import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { CATEGORIES, getToolsByCategory, type ToolCategory } from "@/lib/utils/constants";
import { routing } from "@/i18n/routing";
import { getAlternates } from "@/lib/utils/metadata";
import { ToolIcon } from "@/components/shared/ToolIcon";
import { ToolCard } from "@/components/shared/ToolCard";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.keys(CATEGORIES).map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const category = CATEGORIES[slug as ToolCategory];
  if (!category) return {};
  return {
    title: `${category.name} — Free Online, Private | FileFolks`,
    description: category.metaDescription,
    alternates: getAlternates(locale, `/tools/category/${slug}`),
  };
}

export default async function LocaleCategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const category = CATEGORIES[slug as ToolCategory];
  if (!category) notFound();

  const tools = getToolsByCategory(slug as ToolCategory);
  const tTools = await getTranslations({ locale, namespace: "tools" });
  const tCategories = await getTranslations({ locale, namespace: "Categories" });

  const otherCategories = Object.values(CATEGORIES)
    .filter((c) => c.slug !== slug)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", category.colors.bg)}>
          <ToolIcon slug="" category={category.slug} className={cn("w-5 h-5", category.colors.text)} />
        </div>
        <h1 className="text-2xl font-semibold">{tCategories(slug as ToolCategory)}</h1>
      </div>
      <p className="text-muted-foreground mb-8 ml-12">{category.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <ToolCard
            key={tool.slug}
            tool={tool}
            name={tTools(`${tool.slug}.name`)}
            description={tTools(`${tool.slug}.description`)}
          />
        ))}
      </div>

      {/* Other categories */}
      <div className="mt-12 pt-8 border-t border-border">
        <p className="text-sm font-medium text-muted-foreground mb-4">More tools</p>
        <div className="flex flex-wrap gap-3">
          {otherCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/tools/category/${cat.slug}`}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border border-transparent hover:border-border hover:shadow-sm",
                cat.colors.bg,
                cat.colors.text
              )}
            >
              <ToolIcon slug="" category={cat.slug} className="w-4 h-4" />
              {tCategories(cat.slug as ToolCategory)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
