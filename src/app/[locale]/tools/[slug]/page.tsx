import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { TOOLS, getToolBySlug, getRelatedTools } from "@/lib/utils/constants";
import { getAlternates } from "@/lib/utils/metadata";
import type { FaqItem } from "@/lib/utils/constants";
import { SLUG_TO_NAMESPACE } from "@/lib/utils/toolNamespaces";
import { routing } from "@/i18n/routing";
import { ToolPageLayout } from "@/components/shared/ToolPageLayout";
import { PdfMergerTool } from "@/components/tools/PdfMerger";
import { PdfCompressorTool } from "@/components/tools/PdfCompressor";
import { PdfSplitterTool } from "@/components/tools/PdfSplitter";
import { JsonFormatterTool } from "@/components/tools/JsonFormatter";
import { ImageCompressorTool } from "@/components/tools/ImageCompressor";
import { ImageConverterTool } from "@/components/tools/ImageConverter";
import { Base64Tool } from "@/components/tools/Base64Tool";
import { ImageToPdfTool } from "@/components/tools/ImageToPdfTool";
import { PdfRotatorTool } from "@/components/tools/PdfRotatorTool";
import { ImageResizerTool } from "@/components/tools/ImageResizerTool";
import { ImageCropTool } from "@/components/tools/ImageCropTool";
import { UrlEncoderTool } from "@/components/tools/UrlEncoderTool";
import { JwtDecoderTool } from "@/components/tools/JwtDecoderTool";
import { UuidGeneratorTool } from "@/components/tools/UuidGeneratorTool";
import { HashGeneratorTool } from "@/components/tools/HashGeneratorTool";
import { VideoToGifTool } from "@/components/tools/VideoToGifTool";
import { ExtractFramesTool } from "@/components/tools/ExtractFramesTool";
import { VideoThumbnailTool } from "@/components/tools/VideoThumbnailTool";
import { VideoMetadataTool } from "@/components/tools/VideoMetadataTool";
import { ZipFilesTool } from "@/components/tools/ZipFilesTool";
import { UnzipFilesTool } from "@/components/tools/UnzipFilesTool";
import { WordCounterTool } from "@/components/tools/WordCounterTool";
import { CaseConverterTool } from "@/components/tools/CaseConverterTool";
import { LoremIpsumTool } from "@/components/tools/LoremIpsumTool";
import { DuplicateLineRemoverTool } from "@/components/tools/DuplicateLineRemoverTool";
import { LineSorterTool } from "@/components/tools/LineSorterTool";
import { PasswordGeneratorTool } from "@/components/tools/PasswordGeneratorTool";
import { TimestampConverterTool } from "@/components/tools/TimestampConverterTool";
import { JsonToCsvTool } from "@/components/tools/JsonToCsvTool";

type ToolComponentType = React.ComponentType;

const TOOL_COMPONENTS: Partial<Record<string, ToolComponentType>> = {
  "pdf-merge": PdfMergerTool,
  "compress-pdf": PdfCompressorTool,
  "split-pdf": PdfSplitterTool,
  "image-to-pdf": ImageToPdfTool,
  "pdf-rotate": PdfRotatorTool,
  "json-formatter": JsonFormatterTool,
  "compress-image": ImageCompressorTool,
  "image-convert": ImageConverterTool,
  "image-resize": ImageResizerTool,
  "image-crop": ImageCropTool,
  "base64-encode-decode": Base64Tool,
  "url-encode-decode": UrlEncoderTool,
  "jwt-decoder": JwtDecoderTool,
  "uuid-generator": UuidGeneratorTool,
  "hash-generator": HashGeneratorTool,
  "video-to-gif": VideoToGifTool,
  "extract-frames": ExtractFramesTool,
  "video-thumbnail": VideoThumbnailTool,
  "video-metadata": VideoMetadataTool,
  "zip-files": ZipFilesTool,
  "unzip-files": UnzipFilesTool,
  "word-counter": WordCounterTool,
  "case-converter": CaseConverterTool,
  "lorem-ipsum-generator": LoremIpsumTool,
  "duplicate-line-remover": DuplicateLineRemoverTool,
  "line-sorter": LineSorterTool,
  "password-generator": PasswordGeneratorTool,
  "timestamp-converter": TimestampConverterTool,
  "json-to-csv": JsonToCsvTool,
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
  const tTool = await getTranslations({ locale, namespace: SLUG_TO_NAMESPACE[slug] });

  const title = tTool("seoTitle");
  const description = tTool("seoDescription");

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

  const tTool = await getTranslations({ locale, namespace: SLUG_TO_NAMESPACE[slug] });
  const localizedMeta = {
    ...toolMeta,
    name: tTool("name"),
    description: tTool("description"),
    longDescription: tTool("longDescription"),
    seoTitle: tTool("seoTitle"),
    seoDescription: tTool("seoDescription"),
    faqs: tTool.raw("faqs") as FaqItem[],
  };

  return (
    <ToolPageLayout tool={localizedMeta} related={getRelatedTools(slug)}>
      <ToolComponent />
    </ToolPageLayout>
  );
}
