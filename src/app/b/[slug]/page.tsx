import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HeaderFooter from "@/components/HeaderFooter";
import { BlueprintView } from "@/components/thirty/BlueprintView";
import { loadBlueprint } from "@/lib/thirty/blueprints";
import { EXAMPLE_LINKS } from "@/lib/thirty/examples";
import { isValidSlug } from "@/lib/thirty/slug";

type Params = Promise<{ slug: string }>;

// Blueprints are immutable; cache rendered pages so repeat views skip Redis.
export const revalidate = 300;

export function generateStaticParams() {
  return EXAMPLE_LINKS.map((example) => ({ slug: example.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSlug(slug)) return { title: "Blueprint not found", robots: { index: false } };
  const bp = await loadBlueprint(slug).catch(() => null);
  if (!bp) return { title: "Blueprint not found", robots: { index: false } };
  const title = `${bp.company.name} agent blueprint`;
  const isExample = bp.kind === "example";
  return {
    title,
    description: bp.blueprint.headline,
    alternates: { canonical: `/b/${bp.slug}` },
    ...(isExample ? {} : { robots: { index: false, follow: false } }),
    openGraph: {
      type: "article",
      title,
      description: bp.blueprint.headline,
      url: `/b/${bp.slug}`,
    },
    twitter: { card: "summary_large_image", title, description: bp.blueprint.headline },
  };
}

export default async function BlueprintPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  const blueprint = await loadBlueprint(slug);
  if (!blueprint) notFound();
  return (
    <HeaderFooter page="blueprint">
      <div className="bg-background min-h-screen">
        <BlueprintView blueprint={blueprint} />
      </div>
    </HeaderFooter>
  );
}
