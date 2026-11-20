import type { Metadata } from "next";
import Layout from "@/components/HeaderFooter";
import BlueprintLauncher from "@/components/thirty/BlueprintLauncher";
import LegacyHashRedirect from "@/components/thirty/LegacyHashRedirect";
import { EXAMPLE_LINKS } from "@/lib/thirty/examples";

const HEADLINE = "Your next hire is an AI agent. Davin builds it";
// Search results and link previews keep the full name.
const TITLE = "Your next hire is an AI agent. Davin Harding builds it.";
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
    <Layout page="index" fitViewport>
      <LegacyHashRedirect />
      <section
        data-thirty-stage
        data-step="idle"
        aria-labelledby="home-title"
        className="thirty-stage flex flex-1 flex-col bg-background"
      >
        {/* Top padding approximates vertical centering but keeps the heading's top
            fixed when the taller run console replaces the form below it. During a
            run the headline shrinks (globals.css) so everything still fits. */}
        <div className="container-narrow w-full relative pb-3 pt-[max(5.5rem,calc(42dvh-14rem))] sm:pt-[max(5.5rem,calc(50dvh-15rem))]">
          <div className="mx-auto max-w-2xl">
            <h1 id="home-title" className="heading-hero thirty-hero mb-8 md:mb-10 text-balance">
              {HEADLINE}.
            </h1>
            <BlueprintLauncher examples={EXAMPLE_LINKS} />
          </div>
        </div>
      </section>
    </Layout>
  );
}
