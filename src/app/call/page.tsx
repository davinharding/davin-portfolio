import type { Metadata } from "next";
import HeaderFooter from "@/components/HeaderFooter";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendlyEmbed } from "./CalendlyEmbed";

export const metadata: Metadata = {
  title: "Book a Call",
  description:
    "Schedule a 1-on-1 discovery call with Davin Harding to discuss your project, product, or idea.",
  alternates: { canonical: "/call" },
};

export default function Call() {
  return (
    <HeaderFooter page="container" mobile={true}>
      <div className="bg-background">
        <div className="container-narrow pt-20 pb-2">
          <Button variant="ghost" asChild className="mb-4 -ml-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>
          </Button>
          <h1 className="heading-hero mb-2">Book a Call</h1>
          <p className="text-muted-foreground">
            Let&apos;s discuss your project, product, or idea. Schedule a time
            that works for you.
          </p>
        </div>
        <CalendlyEmbed />
      </div>
    </HeaderFooter>
  );
}
