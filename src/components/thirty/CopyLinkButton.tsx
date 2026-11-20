"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Copies the page URL; falls back to a selected read-only field when the clipboard is unavailable. */
export function CopyLinkButton({ fallbackUrl }: { fallbackUrl: string }) {
  const [url, setUrl] = useState(fallbackUrl);
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(window.location.href.split("#")[0]);
  }, []);

  useEffect(() => {
    if (state === "manual") inputRef.current?.select();
    if (state !== "copied") return;
    const t = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(t);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("manual");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="outline" size="lg" onClick={copy}>
        {state === "copied" ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden="true" />
        )}
        {state === "copied" ? "Link copied" : "Copy link"}
      </Button>
      {state === "manual" ? (
        <label className="text-xs text-muted-foreground">
          Copy this link:
          <input
            ref={inputRef}
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-1 block w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
          />
        </label>
      ) : null}
      <span className="sr-only" role="status">
        {state === "copied" ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
