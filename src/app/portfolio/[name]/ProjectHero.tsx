"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useState } from "react";
import type { Project } from "@/data/projectData";

import { collectProjectImages } from "./projectImages";

const LightboxModal = dynamic(
  () => import("./LightboxModal").then((mod) => mod.LightboxModal),
  { ssr: false }
);

interface ProjectHeroProps {
  project: Project;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);

  const images = collectProjectImages(project);
  const hero = images[0];

  if (!hero) return null;

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Open ${hero.alt || hero.title || "main screenshot"} in lightbox`}
        className="group relative block w-full overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-zoom-in"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={hero.src}
            alt={hero.alt || ""}
            fill
            placeholder={typeof hero.src === "string" ? "empty" : "blur"}
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 896px"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-background/0 transition-all duration-300 group-hover:bg-background/40">
            <div className="flex flex-col items-center gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
              <div className="rounded-full bg-primary/20 p-3 backdrop-blur-sm">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-foreground">
                Click to enlarge
              </span>
            </div>
          </div>
        </div>
      </button>

      {open && (
        <LightboxModal
          images={images}
          index={0}
          onClose={() => setOpen(false)}
          showThumbnails={images.length > 1}
        />
      )}
    </div>
  );
}
