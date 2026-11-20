"use client";

import { useEffect, useState } from "react";
import { InlineWidget } from "react-calendly";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { track } from "@/lib/analytics/track";
import { readHomeAssignment } from "@/lib/experiments/homeDesign";
import {
  blueprintSlugFromSearch,
  CALENDLY_URL,
  calendlyLink,
  calendlyUtm,
  callEventProps,
  createCallTracker,
  type CalendlyUtm,
} from "@/lib/thirty/callFunnel";

const EMBED_HEIGHT = "950px";

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <LoadingSpinner styles="h-14 w-14" />
    </div>
  );
}

export function CalendlyEmbed() {
  // Which blueprint and homepage design led here. Read after mount, because the
  // page is prerendered and both live in the browser (the query string and a cookie).
  const [context, setContext] = useState<{ slug?: string; utm: CalendlyUtm } | null>(null);

  useEffect(() => {
    const slug = blueprintSlugFromSearch(window.location.search);
    const design = readHomeAssignment(document.cookie)?.design ?? null;
    setContext({ slug, utm: calendlyUtm(design, slug) });

    const handle = createCallTracker((event, props) => track(event, props), slug);
    const onMessage = (e: MessageEvent) => handle(e.origin, e.data);
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="bg-background pb-20">
      <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-8">
        <div className="calendly-wrapper overflow-hidden rounded-lg bg-background" style={{ minHeight: EMBED_HEIGHT }}>
          {context ? (
            <InlineWidget
              LoadingSpinner={Spinner}
              url={CALENDLY_URL}
              utm={context.utm}
              pageSettings={{
                hideGdprBanner: true,
                backgroundColor: "020617",
                textColor: "F9FAFB",
                primaryColor: "3B82F6",
              }}
              styles={{ height: EMBED_HEIGHT }}
            />
          ) : (
            <Spinner />
          )}
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Calendar not loading?{" "}
          <a
            href={calendlyLink(context?.utm ?? calendlyUtm(null))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("call_link_opened", callEventProps(context?.slug))}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Open the booking page in a new tab
          </a>
          .
        </p>
      </div>
    </div>
  );
}
