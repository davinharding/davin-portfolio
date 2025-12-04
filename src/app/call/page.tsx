"use client";

import HeaderFooter from "@/components/HeaderFooter";
import { InlineWidget } from "react-calendly";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Call = () => (
  <HeaderFooter page="container" mobile={true}>
    <div className="bg-background">
      {/* Header section */}
      <div className="container-narrow pt-20 pb-2">
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="heading-hero mb-2">Book a Call</h1>
        <p className="text-muted-foreground">
          Let&apos;s discuss your project, product, or idea. Schedule a time that
          works for you.
        </p>
      </div>

      {/* Calendly widget - full width, large fixed height to avoid scrollbar */}
      <div className="calendly-wrapper">
        <InlineWidget
          LoadingSpinner={() => (
            <div className="flex justify-center py-20">
              <LoadingSpinner styles="h-14 w-14" />
            </div>
          )}
          url="https://calendly.com/davinharding/1-on-1-discovery-call?hide_gdpr_banner=1&background_color=020617&text_color=F9FAFB&primary_color=3B82F6"
          styles={{
            height: "950px",
          }}
        />
      </div>
    </div>
  </HeaderFooter>
);

export default Call;
