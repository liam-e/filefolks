import { TOOLS, CATEGORIES, GUIDES } from "@/lib/utils/constants";
import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/utils/metadata";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

function altLanguages(path: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((l) => [l, `${BASE_URL}/${l}${path}`])
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const home = routing.locales.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: locale === "en" ? 1.0 : 0.9,
    alternates: { languages: altLanguages("") },
  }));

  const tools = TOOLS.flatMap((tool) =>
    routing.locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/tools/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: locale === "en" ? 0.9 : 0.8,
      alternates: { languages: altLanguages(`/tools/${tool.slug}`) },
    }))
  );

  const categories = Object.keys(CATEGORIES).flatMap((slug) =>
    routing.locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/tools/category/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: locale === "en" ? 0.7 : 0.6,
      alternates: { languages: altLanguages(`/tools/category/${slug}`) },
    }))
  );

  const guides = GUIDES.flatMap((guide) =>
    routing.locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/guides/${guide.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: locale === "en" ? 0.8 : 0.7,
      alternates: { languages: altLanguages(`/guides/${guide.slug}`) },
    }))
  );

  const privacy = routing.locales.map((locale) => ({
    url: `${BASE_URL}/${locale}/privacy`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  const about = routing.locales.map((locale) => ({
    url: `${BASE_URL}/${locale}/about`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.4,
  }));

  return [...home, ...tools, ...categories, ...guides, ...privacy, ...about];
}
