import { notFound } from "next/navigation";
import { HomeDesignPage } from "@/components/thirty/home/HomeDesignPage";
import { HOME_DESIGNS, isDesign } from "@/lib/experiments/homeDesign";
import { homeMetadata } from "@/lib/thirty/homeCopy";

type Params = Promise<{ variant: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return HOME_DESIGNS.map((variant) => ({ variant }));
}

export const metadata = homeMetadata;

export default async function HomeVariantPage({ params }: { params: Params }) {
  const { variant } = await params;
  if (!isDesign(variant)) notFound();
  return <HomeDesignPage design={variant} />;
}
