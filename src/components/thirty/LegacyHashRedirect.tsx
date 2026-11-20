"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const MOVED = new Set(["#projects", "#skills", "#experience"]);

/** The old homepage sections now live on /work; keep their anchors working. */
export default function LegacyHashRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (MOVED.has(window.location.hash)) router.replace(`/work${window.location.hash}`);
  }, [router]);
  return null;
}
