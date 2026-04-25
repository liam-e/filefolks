import { Link } from "@/i18n/navigation";
import type { ToolMeta } from "@/lib/utils/constants";

interface RelatedToolsProps {
    tools: ToolMeta[];
    title?: string;
}

export function RelatedTools({ tools, title }: RelatedToolsProps) {
    if (tools.length === 0) return null;

    return (
        <section className="mt-12">
            <h2 className="text-xl font-semibold mb-6">{title ?? "Related tools"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tools.map((tool) => (
                    <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                        <div>
                            <div className="text-sm font-medium">{tool.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                {tool.description}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
