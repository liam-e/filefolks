import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TOOLS, CATEGORIES } from "@/lib/utils/constants";
import type { ToolCategory } from "@/lib/utils/constants";

export default function Footer() {
  const t = useTranslations("Footer");
  const tTools = useTranslations("tools");
  const tCategories = useTranslations("Categories");
  const tPrivacy = useTranslations("Privacy");

  const categoriesWithTools = (Object.keys(CATEGORIES) as ToolCategory[])
    .map((slug) => ({
      ...CATEGORIES[slug],
      tools: TOOLS.filter((tool) => tool.category === slug),
    }))
    .filter((cat) => cat.tools.length > 0);

  return (
    <footer className="bg-stone-900 text-stone-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {categoriesWithTools.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
            {categoriesWithTools.map((cat) => (
              <div key={cat.slug}>
                <h3 className="text-xs font-semibold text-stone-100 uppercase tracking-widest mb-3">
                  {tCategories(cat.slug)}
                </h3>
                <ul className="space-y-2">
                  {cat.tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="text-sm text-stone-400 hover:text-orange-400 transition-colors"
                      >
                        {tTools(`${tool.slug}.name`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3 h-3 text-white"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
            </div>
            <span className="text-sm font-medium text-stone-200">FileFolks</span>
          </div>

          <p className="text-xs text-stone-500 text-center sm:text-left">
            {t("tagline")}
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
            >
              {tPrivacy("title")}
            </Link>
            <p className="text-xs text-stone-600">
              {t("copyright")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
