// src/app/tools/category/[slug]/page.tsx

import { CATEGORIES, getToolsByCategory, type ToolCategory } from "@/lib/utils/constants";
import type { Metadata } from "next";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return Object.keys(CATEGORIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const category = CATEGORIES[slug as ToolCategory];
    return {
        title: `${category.name} — Free Online, Private | FileFolks`,
        description: category.metaDescription,
    };
}

export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;
    const category = CATEGORIES[slug as ToolCategory];
    const tools = getToolsByCategory(slug as ToolCategory);

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-2">{category.name}</h1>
            <p className="text-muted-foreground mb-8">{category.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tools.map((tool) => (
                    <a
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                        <h2 className="font-medium mb-1">{tool.name}</h2>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}