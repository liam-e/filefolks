// src/components/shared/ToolFaq.tsx
"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/utils/constants";

interface ToolFaqProps {
    faqs: FaqItem[];
    toolName: string;
    title?: string;
}

export function ToolFaq({ faqs, toolName, title }: ToolFaqProps) {
    if (faqs.length === 0) return null;

    return (
        <section className="mt-12">
            <h2 className="text-xl font-semibold mb-6">
                {title ?? `Frequently asked questions about ${toolName}`}
            </h2>
            <div className="space-y-3">
                {faqs.map((faq, i) => (
                    <FaqAccordion key={i} faq={faq} />
                ))}
            </div>
        </section>
    );
}

function FaqAccordion({ faq }: { faq: FaqItem }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-border rounded-lg">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
                aria-expanded={open}
            >
                <span>{faq.question}</span>
                <span
                    className="ml-4 text-muted-foreground transition-transform duration-200"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                >
          ▾
        </span>
            </button>
            {open && (
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                </div>
            )}
        </div>
    );
}