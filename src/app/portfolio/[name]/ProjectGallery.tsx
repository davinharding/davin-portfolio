"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useState } from "react";
import type { Project } from "@/data/projectData";

import { collectProjectImages } from "./projectImages";

// Defer loading the lightbox modal (yet-another-react-lightbox + plugins + css)
// until the user actually clicks an image. The grid of thumbnails renders
// immediately with just next/image so initial route navigation stays fast.
const LightboxModal = dynamic(
  () => import("./LightboxModal").then((mod) => mod.LightboxModal),
  { ssr: false }
);

interface ProjectGalleryProps {
  project: Project;
  /**
   * Number of leading images to hide from the visible thumbnail grid (e.g. when
   * the first image is rendered separately as a hero). The lightbox itself
   * still includes every image so the user can navigate back to the hero.
   */
  skip?: number;
}

export function ProjectGallery({ project, skip = 0 }: ProjectGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const allImages = collectProjectImages(project);
  const visibleImages = allImages.slice(skip);

  const openAt = useCallback(
    (visibleIdx: number) => {
      setIndex(visibleIdx + skip);
      setOpen(true);
    },
    [skip]
  );

  if (visibleImages.length === 0) return null;

  const columns =
    visibleImages.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";
  const heading = skip > 0 ? "More Screenshots" : "Gallery";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
        <svg
          aria-hidden="true"
          focusable="false"
          className="h-5 w-5 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {heading}
        <span className="text-sm text-muted-foreground font-normal">
          ({visibleImages.length} {visibleImages.length === 1 ? "image" : "images"})
        </span>
      </h3>

      <div className={`grid ${columns} gap-4`}>
        {visibleImages.map((image, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => openAt(idx)}
            aria-label={`Open ${image.alt || image.title || `image ${idx + 1}`} in lightbox`}
            className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background cursor-zoom-in"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt || ""}
                fill
                placeholder={
                  typeof image.src === "string" ? "empty" : "blur"
                }
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 512px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-background/0 transition-all duration-300 group-hover:bg-background/60">
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
            {image.title && (
              <div className="p-3 text-left">
                <p className="text-sm text-muted-foreground">{image.title}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {open && (
        <LightboxModal
          images={allImages}
          index={index}
          onClose={() => setOpen(false)}
          showThumbnails={allImages.length > 1}
        />
      )}
    </div>
  );
}
