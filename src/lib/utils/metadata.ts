import { routing } from "@/i18n/routing";

export const BASE_URL = "https://filefolks.com";

/**
 * Returns Next.js `alternates` metadata with hreflang for every locale.
 * `path` should start with "/" or be "" for the home page.
 */
export function getAlternates(locale: string, path: string) {
  return {
    canonical: `${BASE_URL}/${locale}${path}`,
    languages: {
      "x-default": `${BASE_URL}/en${path}`,
      ...Object.fromEntries(
        routing.locales.map((l) => [l, `${BASE_URL}/${l}${path}`])
      ),
    } as Record<string, string>,
  };
}
