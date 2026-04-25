import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "fr", "de", "pt-BR", "zh-CN", "ja", "ko", "ru", "ar", "it", "nl"],
  defaultLocale: "en",
});

export type Locale = (typeof routing.locales)[number];
