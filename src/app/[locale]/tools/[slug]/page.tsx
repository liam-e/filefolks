import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { TOOLS, getToolBySlug, getRelatedTools } from "@/lib/utils/constants";
import { getAlternates } from "@/lib/utils/metadata";
import type { FaqItem } from "@/lib/utils/constants";
import { routing } from "@/i18n/routing";
import { ToolPageLayout } from "@/components/shared/ToolPageLayout";
import { PdfMergerTool } from "@/components/tools/PdfMerger";
import { PdfCompressorTool } from "@/components/tools/PdfCompressor";
import { PdfSplitterTool } from "@/components/tools/PdfSplitter";
import { JsonFormatterTool } from "@/components/tools/JsonFormatter";
import { ImageCompressorTool } from "@/components/tools/ImageCompressor";
import { ImageConverterTool } from "@/components/tools/ImageConverter";
import { Base64Tool } from "@/components/tools/Base64Tool";

type ToolComponentType = React.ComponentType;

const TOOL_COMPONENTS: Partial<Record<string, ToolComponentType>> = {
  "pdf-merge": PdfMergerTool,
  "compress-pdf": PdfCompressorTool,
  "split-pdf": PdfSplitterTool,
  "json-formatter": JsonFormatterTool,
  "compress-image": ImageCompressorTool,
  "image-convert": ImageConverterTool,
  "base64-encode-decode": Base64Tool,
};

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    TOOLS.map((tool) => ({ locale, slug: tool.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const toolMeta = getToolBySlug(slug);
  if (!toolMeta) return {};

  setRequestLocale(locale);
  const tTools = await getTranslations({ locale, namespace: "tools" });

  const title = tTools(`${slug}.seoTitle`);
  const description = tTools(`${slug}.seoDescription`);

  return {
    title,
    description,
    keywords: toolMeta.keywords,
    openGraph: {
      title,
      description,
      url: `https://filefolks.com/${locale}/tools/${slug}`,
      type: "website",
      siteName: "FileFolks",
    },
    alternates: getAlternates(locale, `/tools/${slug}`),
  };
}

export default async function LocaleToolPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const toolMeta = getToolBySlug(slug);
  if (!toolMeta) notFound();

  const ToolComponent = TOOL_COMPONENTS[slug];
  if (!ToolComponent) notFound();

  const tTools = await getTranslations({ locale, namespace: "tools" });
  const localizedMeta = {
    ...toolMeta,
    name: tTools(`${slug}.name`),
    description: tTools(`${slug}.description`),
    longDescription: tTools(`${slug}.longDescription`),
    seoTitle: tTools(`${slug}.seoTitle`),
    seoDescription: tTools(`${slug}.seoDescription`),
    faqs: tTools.raw(`${slug}.faqs`) as FaqItem[],
  };

  return (
    <ToolPageLayout tool={localizedMeta} related={getRelatedTools(slug)}>
      <ToolComponent />
    </ToolPageLayout>
  );
}
