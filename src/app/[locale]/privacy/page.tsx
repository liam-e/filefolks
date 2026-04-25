import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
    description:
      "FileFolks processes all files locally in your browser. No data is ever uploaded or stored.",
    alternates: getAlternates(locale, "/privacy"),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Privacy" });

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

      <Section heading="The short version">
        FileFolks processes everything in your browser. Your files never leave your device.
        We do not collect, store, or transmit any personal data or file content.
      </Section>

      <Section heading="File processing">
        All file operations (merging PDFs, compressing PDFs, formatting JSON, etc.) run
        entirely using browser APIs and WebAssembly. No file data is sent to any server.
        You can verify this by opening your browser&apos;s Network tab while using any tool
        — you will see no upload requests.
      </Section>

      <Section heading="Data we collect">
        <p className="text-muted-foreground mb-2">We collect nothing. Specifically:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>No account or registration required</li>
          <li>No cookies set by FileFolks</li>
          <li>No analytics or tracking scripts</li>
          <li>No file names, sizes, or contents transmitted</li>
          <li>No IP address logging by FileFolks</li>
        </ul>
      </Section>

      <Section heading="Hosting">
        FileFolks is hosted on Microsoft Azure Static Web Apps. Azure may retain standard
        web server access logs (IP address, timestamp, URL requested) as part of normal
        hosting infrastructure. These logs are outside FileFolks&apos; control and are
        governed by{" "}
        <a
          href="https://privacy.microsoft.com/en-us/privacystatement"
          className="text-primary underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Microsoft&apos;s Privacy Statement
        </a>
        .
      </Section>

      <Section heading="Fonts and assets">
        Page fonts (Inter) are self-hosted. No requests are made to Google Fonts or any
        external font provider.
      </Section>

      <Section heading="Your rights">
        Because FileFolks does not collect personal data, there is nothing to access,
        correct, export, or delete. Questions? Contact us at the address below.
      </Section>

      <Section heading="Changes to this policy">
        If this policy changes materially, we will update the date at the top of this page.
        The current version is always available at{" "}
        <span className="font-mono text-sm">filefolks.com/en/privacy</span>.
      </Section>

      <Section heading="Contact">
        Questions about privacy? Email{" "}
        <a href="mailto:privacy@filefolks.com" className="text-primary underline">
          privacy@filefolks.com
        </a>
        .
      </Section>
    </div>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{heading}</h2>
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    </section>
  );
}
