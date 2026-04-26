import { Link } from "@/i18n/navigation";
import { ToolIcon } from "@/components/shared/ToolIcon";
import { CATEGORIES } from "@/lib/utils/constants";
import type { ToolMeta } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: ToolMeta;
  name: string;
  description: string;
}

export function ToolCard({ tool, name, description }: ToolCardProps) {
  const { bg, text } = CATEGORIES[tool.category].colors;

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all duration-150 h-full"
    >
      <div className={cn("shrink-0 w-10 h-10 rounded-lg flex items-center justify-center", bg)}>
        <ToolIcon slug={tool.slug} category={tool.category} className={cn("w-5 h-5", text)} />
      </div>
      <div className="min-w-0 flex flex-col">
        <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate mb-0.5">
          {name}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.75rem]">
          {description}
        </p>
      </div>
    </Link>
  );
}
