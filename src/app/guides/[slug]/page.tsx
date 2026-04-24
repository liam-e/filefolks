import type { Metadata } from "next";
import { GUIDES, getGuideBySlug, getToolBySlug } from "@/lib/utils/constants";
import { GuidePageLayout } from "@/components/shared/GuidePageLayout";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
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
    alternates: { canonical: `https://filefolks.com/guides/${guide.slug}` },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return <div>Guide not found</div>;

  const relatedTool = guide.relatedToolSlug
    ? getToolBySlug(guide.relatedToolSlug)
    : undefined;

  return <GuidePageLayout guide={guide} relatedTool={relatedTool} />;
}
