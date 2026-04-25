import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { GUIDES, getGuideBySlug, getToolBySlug } from "@/lib/utils/constants";
import { routing } from "@/i18n/routing";
import { getAlternates } from "@/lib/utils/metadata";
import { GuidePageLayout } from "@/components/shared/GuidePageLayout";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    GUIDES.map((g) => ({ locale, slug: g.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `https://filefolks.com/guides/${guide.slug}`,
      type: "article",
      siteName: "FileFolks",
    },
    alternates: getAlternates(locale, `/guides/${guide.slug}`),
  };
}

export default async function LocaleGuidePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const relatedTool = guide.relatedToolSlug
    ? getToolBySlug(guide.relatedToolSlug)
    : undefined;

  return <GuidePageLayout guide={guide} relatedTool={relatedTool} />;
}
