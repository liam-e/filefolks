import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { CATEGORIES, getToolsByCategory, type ToolCategory } from "@/lib/utils/constants";
import { routing } from "@/i18n/routing";
import { getAlternates } from "@/lib/utils/metadata";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.keys(CATEGORIES).map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES[slug as ToolCategory];
  if (!category) return {};
  const { locale } = await params;
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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">{category.name}</h1>
      <p className="text-muted-foreground mb-8">{category.description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <h2 className="font-medium mb-1">{tool.name}</h2>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
