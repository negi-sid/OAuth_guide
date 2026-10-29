import { notFound } from "next/navigation";
import { GuideView } from "@/components/guide-view";
import { getGuide, listGuides } from "@/lib/guides";

export function generateStaticParams() {
  return listGuides().map((g) => ({ slug: g.slug }));
}

/** Curated shareable guide page. */
export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return <GuideView guide={guide} />;
}
