import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar } from "lucide-react";
import HeaderFooter from "@/components/HeaderFooter";
import { Button } from "@/components/ui/button";
import BlueprintLauncher from "@/components/thirty/BlueprintLauncher";
import { ERROR_CODES, ERRORS, codeFromSorryParam, errorMessage, sorryParam } from "@/lib/thirty/errors";
import { EXAMPLE_LINKS } from "@/lib/thirty/examples";

type Params = Promise<{ code: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return ERROR_CODES.map((code) => ({ code: sorryParam(code) }));
}

export const metadata: Metadata = {
  title: "That did not work",
  robots: { index: false, follow: false },
};

export default async function SorryPage({ params }: { params: Params }) {
  const { code: param } = await params;
  const code = codeFromSorryParam(param);
  if (!code) notFound();
  const next = ERRORS[code].next;

  return (
    <HeaderFooter page="sorry">
      <section data-thirty-stage data-step="idle" className="thirty-stage min-h-[100dvh] bg-background flex items-center">
        <div className="container-narrow w-full py-24">
          <div className="mx-auto max-w-2xl">
            <h1 className="heading-section mb-3">That did not work.</h1>
            <p role="alert" className="text-body mb-6 text-foreground/90">
              {errorMessage(code)}
            </p>
            {next.includes("book_call") ? (
              <Button asChild size="lg" className="mb-8">
                <Link href="/call">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Book a call
                </Link>
              </Button>
            ) : null}
            <BlueprintLauncher examples={EXAMPLE_LINKS} />
          </div>
        </div>
      </section>
    </HeaderFooter>
  );
}
