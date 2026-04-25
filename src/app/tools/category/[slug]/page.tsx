import { redirect } from "next/navigation";
import { CATEGORIES } from "@/lib/utils/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/en/tools/category/${slug}`);
}
