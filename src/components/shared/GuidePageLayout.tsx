import Link from "next/link";
import type { InstructionalGuide, ToolMeta } from "@/lib/utils/constants";
import { generateBreadcrumbJsonLd } from "@/lib/utils/structured-data";

interface GuidePageLayoutProps {
  guide: InstructionalGuide;
  relatedTool?: ToolMeta;
}

export function GuidePageLayout({ guide, relatedTool }: GuidePageLayoutProps) {
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.description,
    step: guide.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.title,
      text: step.body.replace(/\[.*?\]\(.*?\)/g, "").replace(/\*\*/g, ""),
      ...(step.image ? { image: step.image } : {}),
    })),
    tool: { "@type": "HowToTool", name: "Web browser" },
  };

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "https://filefolks.com" },
    { name: "Guides", url: "https://filefolks.com/guides" },
    { name: guide.title, url: `https://filefolks.com/guides/${guide.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([howToJsonLd, breadcrumbJsonLd]) }}
      />

      <article className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">{guide.title}</h1>
        <p className="text-muted-foreground mb-8">{guide.description}</p>

        {relatedTool && (
          <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 mb-8 text-sm">
            This guide uses the{" "}
            <Link
              href={`/tools/${relatedTool.slug}`}
              className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
            >
              {relatedTool.name}
            </Link>{" "}
            tool.
          </div>
        )}

        {/* Steps */}
        <ol className="space-y-8">
          {guide.steps.map((step, i) => (
            <li key={i} className="relative pl-10">
              <div
                className={`absolute left-0 top-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.isOffTool
                    ? "bg-amber-100 text-amber-700"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {i + 1}
              </div>

              <h2 className="font-medium mb-2">
                {step.title}
                {step.isOffTool && (
                  <span className="ml-2 text-xs font-normal text-amber-600">
                    On your device
                  </span>
                )}
              </h2>

              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {step.body}
              </div>
            </li>
          ))}
        </ol>

        {/* Link back to the tool */}
        {relatedTool && (
          <div className="mt-12 rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">Ready to try it yourself?</p>
            <Link
              href={`/tools/${relatedTool.slug}`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary/80 transition-colors"
            >
              Open {relatedTool.name}
            </Link>
          </div>
        )}
      </article>
    </>
  );
}
