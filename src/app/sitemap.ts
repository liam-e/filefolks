// src/app/sitemap.ts

import { TOOLS, CATEGORIES, getAllUsedTags } from "@/lib/utils/constants";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
    const base = "https://filefolks.com";

    const tools = TOOLS.map((tool) => ({
        url: `${base}/tools/${tool.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }));

    const categories = Object.keys(CATEGORIES).map((slug) => ({
        url: `${base}/tools/category/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    // Only include tags that are actually used
    const tags = getAllUsedTags().map(({ tag }) => ({
        url: `${base}/tools/tag/${tag}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
    }));

    const guides = TOOLS
        .filter((t) => t.guideSlug)
        .map((t) => ({
            url: `${base}/guides/${t.guideSlug}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.6,
        }));

    return [
        { url: base, lastModified: new Date(), priority: 1.0 },
        { url: `${base}/about`, lastModified: new Date(), priority: 0.5 },
        ...tools,
        ...categories,
        ...tags,
        ...guides,
    ];
}