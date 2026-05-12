"use client";

import { InlineWidget } from "react-calendly";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export function CalendlyEmbed() {
  return (
    <div className="bg-background pb-20">
      <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-8">
        <div className="calendly-wrapper overflow-hidden rounded-lg bg-background">
          <InlineWidget
            LoadingSpinner={() => (
              <div className="flex justify-center py-20">
                <LoadingSpinner styles="h-14 w-14" />
              </div>
            )}
            url="https://calendly.com/davinharding/1-on-1-discovery-call"
            pageSettings={{
              hideGdprBanner: true,
              backgroundColor: "020617",
              textColor: "F9FAFB",
              primaryColor: "3B82F6",
            }}
            styles={{ height: "950px" }}
          />
        </div>
      </div>
    </div>
  );
}
