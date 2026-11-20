"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlueprintError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[thirty] blueprint page error", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="bg-background min-h-[100dvh] flex items-center">
      <div className="container-narrow py-24 max-w-2xl">
        <h1 className="heading-section mb-3">Blueprints are temporarily unavailable</h1>
        <p className="text-body mb-6">Something on my side is down. Try again in a moment.</p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={() => reset()}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Back to the homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
