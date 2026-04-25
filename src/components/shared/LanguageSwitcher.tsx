"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  "pt-BR": "Português",
  "zh-CN": "中文",
  ja: "日本語",
  ko: "한국어",
  ru: "Русский",
  ar: "العربية",
  it: "Italiano",
  nl: "Nederlands",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSelect(next: string) {
    setOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <GlobeIcon />
        <span>{LOCALE_LABELS[locale] ?? locale}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="listbox"
            className="absolute right-0 top-full mt-2 z-20 bg-popover border border-border rounded-lg shadow-md py-1 min-w-[148px]"
          >
            {routing.locales.map((loc) => (
              <button
                key={loc}
                role="option"
                aria-selected={loc === locale}
                type="button"
                onClick={() => handleSelect(loc)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  loc === locale ? "text-primary font-medium" : "text-foreground"
                }`}
              >
                {LOCALE_LABELS[loc] ?? loc}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
