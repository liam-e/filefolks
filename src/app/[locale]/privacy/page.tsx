import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getAlternates } from "@/lib/utils/metadata";

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Privacy Policy | FileFolks",
    description: "FileFolks processes all files locally in your browser. No data is ever uploaded or stored.",
    alternates: getAlternates(locale, "/privacy"),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

      <Section heading="Your files never leave your browser">
        Every tool on FileFolks runs entirely in your browser using WebAssembly and native
        browser APIs. No file data — names, contents, or metadata — is ever sent to a server.
        Open your browser&apos;s Network tab while using any tool and you will see no upload
        requests.
      </Section>

      <Section heading="What we collect">
        Nothing. FileFolks sets no cookies, loads no analytics or tracking scripts, and
        requires no account. We do not log or store anything about you or your files.
      </Section>

      <Section heading="Hosting">
        The site is hosted on Microsoft Azure Static Web Apps. Azure may retain standard
        server access logs (IP address, timestamp, URL) as part of normal hosting
        infrastructure. These logs are controlled by Microsoft, not FileFolks, and are
        covered by{" "}
        <a
          href="https://privacy.microsoft.com/en-us/privacystatement"
          className="text-primary underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          Microsoft&apos;s Privacy Statement
        </a>
        .
      </Section>

      <Section heading="Fonts">
        Page fonts are self-hosted at build time via Next.js. No requests are made to
        Google Fonts or any external provider.
      </Section>

      <Section heading="Changes">
        Material changes will be reflected by an updated date at the top of this page.
      </Section>
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{heading}</h2>
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    </section>
  );
}
