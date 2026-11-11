import type { Metadata } from "next";
import Layout from "@/components/HeaderFooter";
import BlueprintLauncher from "@/components/thirty/BlueprintLauncher";
import LegacyHashRedirect from "@/components/thirty/LegacyHashRedirect";
import { EXAMPLE_LINKS } from "@/lib/thirty/examples";

const TITLE = "Davin Harding builds AI agents that ship";
const DESCRIPTION =
  "Enter your company's website and watch my agents draft a blueprint of the AI agents I would build for you, in about 30 seconds.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function Home() {
  return (
    <Layout page="index">
      <LegacyHashRedirect />
      <section
        data-thirty-stage
        data-step="idle"
        aria-labelledby="home-title"
        className="thirty-stage min-h-[100dvh] bg-background"
      >
        {/* Top padding approximates vertical centering but keeps the heading fixed
            when the taller run console replaces the form below it. */}
        <div className="container-narrow w-full relative pb-24 pt-[max(6rem,calc(50dvh-12rem))]">
          <div className="mx-auto max-w-2xl">
            <h1 id="home-title" className="heading-hero mb-8 md:mb-10 text-balance">
              Davin Harding builds AI agents that ship.
            </h1>
            <BlueprintLauncher examples={EXAMPLE_LINKS} />
          </div>
        </div>
      </section>
    </Layout>
  );
}
