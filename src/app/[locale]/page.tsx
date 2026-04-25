import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TOOLS, CATEGORIES } from "@/lib/utils/constants";
import type { ToolCategory } from "@/lib/utils/constants";
import { getAlternates } from "@/lib/utils/metadata";
import { ToolIcon } from "@/components/shared/ToolIcon";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: getAlternates(locale, "") };
}

// Group tools by category, each group sorted by popularity (asc).
// Categories ordered by their explicit displayOrder (edit CATEGORIES in constants.ts
// to reprioritise sections as traffic data changes).
function getGroupedTools() {
  const byCategory = TOOLS.reduce<Record<string, typeof TOOLS>>((acc, tool) => {
    (acc[tool.category] ??= []).push(tool);
    return acc;
  }, {});

  return Object.entries(byCategory)
    .map(([slug, tools]) => ({
      category: CATEGORIES[slug as ToolCategory],
      tools: [...tools].sort((a, b) => a.popularity - b.popularity),
    }))
    .sort((a, b) => a.category.displayOrder - b.category.displayOrder);
}

const groupedTools = getGroupedTools();

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const tTools = await getTranslations({ locale, namespace: "tools" });
  const tCategories = await getTranslations({ locale, namespace: "Categories" });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {t("badge")}
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5">
          {t("headline")}{" "}
          <span className="text-primary">{t("headlineAccent")}</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
          {t("subheadline")}
        </p>
      </div>

      {/* Tools — grouped by category */}
      <div className="space-y-12">
        {groupedTools.map(({ category, tools }) => (
          <section key={category.slug} aria-labelledby={`cat-${category.slug}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", category.colors.bg)}>
                  <ToolIcon slug="" category={category.slug} className={cn("w-4 h-4", category.colors.text)} />
                </div>
                <h2 id={`cat-${category.slug}`} className="text-lg font-semibold">
                  {tCategories(category.slug as ToolCategory)}
                </h2>
              </div>
              <Link
                href={`/tools/category/${category.slug}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("viewAll")} →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate mb-0.5">
                      {tTools(`${tool.slug}.name`)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tTools(`${tool.slug}.description`)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Privacy callout */}
      <div className="mt-16 rounded-2xl bg-primary/10 border border-primary/20 px-8 py-10 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">{t("privacyTitle")}</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">{t("privacyBody")}</p>
      </div>
    </div>
  );
}
