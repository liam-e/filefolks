import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FileFolks - Free, Private Browser Tools",
    template: "%s | FileFolks",
  },
  description:
    "Free browser-based file and developer tools. No uploads, no accounts, no tracking. Everything runs on your device.",
};

// [locale]/layout.tsx provides <html>, <body>, and NextIntlClientProvider.
// This root layout is a minimal pass-through for the locale subtree.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children as React.ReactElement;
}
