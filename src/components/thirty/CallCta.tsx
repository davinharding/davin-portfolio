"use client";

import Link from "next/link";
import { track } from "@/lib/analytics/track";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallCta({ label = "Book a call to build the first one" }: { label?: string }) {
  return (
    <Button asChild size="lg">
      <Link
        href="/call"
        onClick={() => track("blueprint_cta_call", { from: "blueprint" })}
      >
        <Calendar className="h-4 w-4" aria-hidden="true" />
        {label}
      </Link>
    </Button>
  );
}
