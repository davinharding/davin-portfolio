"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallCta({ label = "Book a call to build the first one" }: { label?: string }) {
  return (
    <Button asChild size="lg">
      <Link
        href="/call"
        onClick={() => {
          try {
            track("blueprint_cta_call");
          } catch {
            // Analytics must never affect navigation.
          }
        }}
      >
        <Calendar className="h-4 w-4" aria-hidden="true" />
        {label}
      </Link>
    </Button>
  );
}
