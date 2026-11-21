"use client";

import { useEffect } from "react";
import { reportHomeView } from "@/lib/experiments/browser";
import type { HomeDesign } from "@/lib/experiments/homeDesign";

export function HomeView({ design }: { design: HomeDesign }) {
  useEffect(() => {
    reportHomeView(design);
  }, [design]);
  return null;
}
