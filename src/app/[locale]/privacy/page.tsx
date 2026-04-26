import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getAlternates } from "@/lib/utils/metadata";

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return {
    title: `${t("title")} | FileFolks`,
    description: t("metaDescription"),
    alternates: getAlternates(locale, "/privacy"),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Privacy" });

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-10">{t("lastUpdated")}</p>

      <Section heading={t("s1Heading")}>{t("s1Body")}</Section>
      <Section heading={t("s2Heading")}>{t("s2Body")}</Section>
      <Section heading={t("s3Heading")}>{t("s3Body")}</Section>
      <Section heading={t("s4Heading")}>{t("s4Body")}</Section>
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{heading}</h2>
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    </section>
  );
}
