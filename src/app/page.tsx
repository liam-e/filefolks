import Link from "next/link";
import { TOOLS, CATEGORIES } from "@/lib/utils/constants";
import { ToolIcon } from "@/components/shared/ToolIcon";
import { cn } from "@/lib/utils";

const sortedTools = [...TOOLS].sort((a, b) => a.popularity - b.popularity);

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-6">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          No uploads. No accounts. No tracking.
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5">
          Tools that work{" "}
          <span className="text-primary">for you</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
          Every tool runs entirely in your browser. Your files never leave your device.
        </p>
      </div>

      {/* Tools grid — ordered by traffic / popularity */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTools.map((tool) => {
          const category = CATEGORIES[tool.category];
          const { bg, text, badge } = category.colors;
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group flex gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all duration-150"
            >
              {/* Icon */}
              <div
                className={cn(
                  "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                  bg
                )}
              >
                <ToolIcon
                  slug={tool.slug}
                  category={tool.category}
                  className={cn("w-5 h-5", text)}
                />
              </div>

              {/* Content */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {tool.name}
                  </h2>
                  <span className={cn("shrink-0 text-xs px-2 py-0.5 rounded-full font-medium", badge)}>
                    {category.name.replace(" tools", "")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Privacy callout */}
      <div className="mt-16 rounded-2xl bg-primary/10 border border-primary/20 px-8 py-10 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Your files stay on your device
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          FileFolks uses WebAssembly and browser APIs to process files locally.
          Nothing is ever sent to a server. You can verify this by checking the
          Network tab in your browser&apos;s developer tools.
        </p>
      </div>
    </div>
  );
}
