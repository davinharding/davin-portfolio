"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCallCta } from "@/lib/analytics/track";
import { callPath } from "@/lib/thirty/callFunnel";

type CallCtaProps = {
  /** The blueprint this link sits on, so the booking can be traced back to it. */
  slug: string;
  label?: string;
};

export function CallCta({ slug, label = "Book a call to build the first one" }: CallCtaProps) {
  return (
    <Button asChild size="lg">
      <Link href={callPath(slug)} onClick={() => trackCallCta("blueprint")}>
        <Calendar className="h-4 w-4" aria-hidden="true" />
        {label}
      </Link>
    </Button>
  );
}
