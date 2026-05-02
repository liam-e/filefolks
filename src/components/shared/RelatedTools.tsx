import { useMessages } from "next-intl";
import type { ToolMeta } from "@/lib/utils/constants";
import { ToolCard } from "@/components/shared/ToolCard";
import { SLUG_TO_NAMESPACE } from "@/lib/utils/toolNamespaces";

interface RelatedToolsProps {
  tools: ToolMeta[];
  title?: string;
}

export function RelatedTools({ tools, title }: RelatedToolsProps) {
  const messages = useMessages() as Record<string, Record<string, string>>;

  if (tools.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-6">{title ?? "Related tools"}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <ToolCard
            key={tool.slug}
            tool={tool}
            name={messages[SLUG_TO_NAMESPACE[tool.slug]]?.name ?? tool.name}
            description={messages[SLUG_TO_NAMESPACE[tool.slug]]?.description ?? tool.description}
          />
        ))}
      </div>
    </section>
  );
}
