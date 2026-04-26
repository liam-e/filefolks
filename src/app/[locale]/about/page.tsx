import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getAlternates } from "@/lib/utils/metadata";
import { TOOLS } from "@/lib/utils/constants";

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return {
    title: `${t("title")} | FileFolks`,
    description: t("metaDescription"),
    alternates: getAlternates(locale, "/about"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "About" });

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>{t("p1", { count: TOOLS.length })}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold mb-3 text-foreground">{t("contactHeading")}</h2>
        <p className="text-muted-foreground">
          {t("contactBody")}{" "}
          <a
            href="mailto:contact@filefolks.com"
            className="text-primary underline underline-offset-2"
          >
            contact@filefolks.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
