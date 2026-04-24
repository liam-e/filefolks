// src/lib/utils/structured-data.ts

import type { ToolMeta, FaqItem } from "@/lib/utils/constants";

/**
 * Generate FAQPage JSON-LD for a tool's FAQ section.
 * Google can display these as expandable rich results in search.
 * See: https://developers.google.com/search/docs/appearance/structured-data/faqpage
 */
export function generateFaqJsonLd(faqs: FaqItem[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };
}

/**
 * Generate SoftwareApplication JSON-LD for a tool page.
 * Tells Google this is a web application, not just a regular page.
 */
export function generateToolJsonLd(tool: ToolMeta) {
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.seoDescription,
        url: `https://filefolks.com/tools/${tool.slug}`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any (browser-based)",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "AUD",
        },
        creator: {
            "@type": "Person",
            name: "Liam",
            url: "https://filefolks.com/about",
        },
    };
}

/**
 * Generate BreadcrumbList JSON-LD for navigation.
 */
export function generateBreadcrumbJsonLd(
    items: { name: string; url: string }[]
) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItemElement",
            position: i + 1,
            name: item.name,
            item: item.url,
        })),
    };
}