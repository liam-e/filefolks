import type { Metadata } from "next";
import { getToolBySlug, getRelatedTools } from "@/lib/utils/constants";
import { ToolPageLayout } from "@/components/shared/ToolPageLayout";
import { JsonFormatterTool } from "@/components/tools/JsonFormatter";

const tool = getToolBySlug("json-formatter")!;

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

export default function JsonFormatterPage() {
  return (
    <ToolPageLayout tool={tool} related={getRelatedTools(tool.slug)}>
      <JsonFormatterTool />
    </ToolPageLayout>
  );
}
