import type { Metadata } from "next";
import { getToolBySlug, getRelatedTools } from "@/lib/utils/constants";
import { ToolPageLayout } from "@/components/shared/ToolPageLayout";
import { PdfMergerTool } from "@/components/tools/PdfMerger";

const tool = getToolBySlug("pdf-merge")!;

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  keywords: tool.keywords,
  openGraph: {
    title: tool.seoTitle,
    description: tool.seoDescription,
    url: `https://filefolks.com/tools/${tool.slug}`,
    type: "website",
    siteName: "FileFolks",
  },
  alternates: { canonical: `https://filefolks.com/tools/${tool.slug}` },
};

export default function PdfMergePage() {
  return (
    <ToolPageLayout tool={tool} related={getRelatedTools(tool.slug)}>
      <PdfMergerTool />
    </ToolPageLayout>
  );
}
