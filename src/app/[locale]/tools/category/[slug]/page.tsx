import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { CATEGORIES, getToolsByCategory, type ToolCategory } from "@/lib/utils/constants";
import { routing } from "@/i18n/routing";
import { getAlternates } from "@/lib/utils/metadata";
import { ToolIcon } from "@/components/shared/ToolIcon";
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
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group flex gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all duration-150"
          >
            <div className={cn("shrink-0 w-10 h-10 rounded-lg flex items-center justify-center", category.colors.bg)}>
              <ToolIcon slug={tool.slug} category={tool.category} className={cn("w-5 h-5", category.colors.text)} />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate mb-0.5">
                {tTools(`${tool.slug}.name`)}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tTools(`${tool.slug}.description`)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
