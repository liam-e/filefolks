import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getAlternates } from "@/lib/utils/metadata";
import { TOOLS } from "@/lib/utils/constants";

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "About | FileFolks",
    description: "FileFolks is a free collection of browser-based file and developer tools. No uploads, no accounts, no tracking.",
    alternates: getAlternates(locale, "/about"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">About FileFolks</h1>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          FileFolks is a free collection of {TOOLS.length} file and developer tools that
          run entirely in your browser. No uploads, no accounts, no tracking.
        </p>
        <p>
          Most online file tools work by uploading your files to a remote server, processing
          them, and sending them back. FileFolks takes a different approach: every operation
          — merging PDFs, compressing images, formatting JSON, generating hashes — happens
          locally using WebAssembly and native browser APIs. Your files never leave your device.
        </p>
        <p>
          The goal is a fast, private alternative for everyday file tasks. No sign-up
          required, no file size nags, no watermarks.
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold mb-3 text-foreground">Contact</h2>
        <p className="text-muted-foreground">
          Questions, feedback, or tool suggestions — email{" "}
          <a
            href="mailto:contact@filefolks.com"
            className="text-primary underline underline-offset-2"
          >
            contact@filefolks.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
