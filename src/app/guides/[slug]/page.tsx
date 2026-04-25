import { redirect } from "next/navigation";
import { GUIDES } from "@/lib/utils/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  redirect(`/en/guides/${slug}`);
}
