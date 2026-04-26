import { useTranslations } from "next-intl";
import type { ToolMeta } from "@/lib/utils/constants";
import { ToolCard } from "@/components/shared/ToolCard";

interface RelatedToolsProps {
  tools: ToolMeta[];
  title?: string;
}

export function RelatedTools({ tools, title }: RelatedToolsProps) {
  const t = useTranslations("tools");

  if (tools.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-6">{title ?? "Related tools"}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <ToolCard
            key={tool.slug}
            tool={tool}
            name={t(`${tool.slug}.name`)}
            description={t(`${tool.slug}.description`)}
          />
        ))}
      </div>
    </section>
  );
}
