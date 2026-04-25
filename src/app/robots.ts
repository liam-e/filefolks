import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/utils/metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Disallow the legacy redirect pages — real content lives under /[locale]/
        disallow: ["/tools/", "/guides/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
