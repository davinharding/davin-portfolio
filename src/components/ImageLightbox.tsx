"use client";

import { useState, useCallback } from "react";
import Image, { StaticImageData } from "next/image";
import Lightbox, { SlideImage } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// Custom Next.js Image component for the lightbox
interface NextJsImageProps {
  slide: SlideImage;
  rect: { width: number; height: number };
}

function NextJsImage({ slide, rect }: NextJsImageProps) {
  const { width, height } = rect;
  const cover = slide.imageFit === "cover";

  return (
    <div style={{ position: "relative", width, height }}>
      <Image
        fill
        alt={slide.alt || ""}
        src={slide.src}
        loading="eager"
        draggable={false}
        style={{
          objectFit: cover ? "cover" : "contain",
        }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
      />
    </div>
  );
}

export interface LightboxImage {
  src: string | StaticImageData;
  alt?: string;
  title?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  className?: string;
  imageClassName?: string;
  showThumbnails?: boolean;
  columns?: 1 | 2 | 3;
}

export function ImageLightbox({
  images,
  className = "",
  imageClassName = "",
  showThumbnails = true,
  columns = 2,
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openLightbox = useCallback((idx: number) => {
    setIndex(idx);
    setOpen(true);
  }, []);

  // Convert images to lightbox format
  const slides: SlideImage[] = images.map((img) => ({
    src: typeof img.src === "string" ? img.src : img.src.src,
    alt: img.alt || "",
    title: img.title,
  }));

  // Grid layout classes based on columns
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <>
      <div className={`grid ${gridClasses[columns]} gap-4 ${className}`}>
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => openLightbox(idx)}
            className={`
              group relative overflow-hidden rounded-lg border border-border
              bg-card transition-all duration-300
              hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
              ${imageClassName}
            `}
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt || ""}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-background/0 transition-all duration-300 group-hover:bg-background/60">
                <div className="flex flex-col items-center gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <div className="rounded-full bg-primary/20 p-3 backdrop-blur-sm">
                    <svg
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

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
        plugins={showThumbnails ? [Zoom, Counter, Thumbnails] : [Zoom, Counter]}
        render={{ slide: NextJsImage }}
        carousel={{
          finite: images.length <= 1,
          preload: 2,
        }}
        animation={{
          fade: 300,
          swipe: 300,
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true,
        }}
        counter={{
          container: {
            style: {
              top: "unset",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
            },
          },
        }}
        thumbnails={{
          position: "bottom",
          width: 100,
          height: 60,
          border: 2,
          borderRadius: 8,
          padding: 4,
          gap: 12,
          showToggle: true,
        }}
        styles={{
          container: {
            backgroundColor: "rgba(2, 6, 23, 0.95)",
            backdropFilter: "blur(12px)",
          },
          root: {
            "--yarl__color_backdrop": "rgba(2, 6, 23, 0.95)",
            "--yarl__color_button": "hsl(217.2 91.2% 59.8%)",
            "--yarl__color_button_active": "hsl(217.2 91.2% 69.8%)",
            "--yarl__thumbnails_thumbnail_border": "hsl(217.2 32.6% 17.5%)",
            "--yarl__thumbnails_thumbnail_active_border":
              "hsl(217.2 91.2% 59.8%)",
            "--yarl__thumbnails_container_background_color": "rgba(2, 6, 23, 0.8)",
            "--yarl__counter_container_background_color": "rgba(2, 6, 23, 0.7)",
          } as React.CSSProperties,
          toolbar: {
            backgroundColor: "transparent",
          },
          navigationPrev: {
            color: "hsl(217.2 91.2% 59.8%)",
            filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))",
          },
          navigationNext: {
            color: "hsl(217.2 91.2% 59.8%)",
            filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))",
          },
        }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
          closeOnPullUp: true,
        }}
      />
    </>
  );
}

// Single image lightbox for standalone use
interface SingleImageLightboxProps {
  src: string | StaticImageData;
  alt?: string;
  className?: string;
  aspectRatio?: "video" | "square" | "auto";
  priority?: boolean;
}

export function SingleImageLightbox({
  src,
  alt = "",
  className = "",
  aspectRatio = "video",
  priority = false,
}: SingleImageLightboxProps) {
  const [open, setOpen] = useState(false);

  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    auto: "",
  };

  const slide: SlideImage = {
    src: typeof src === "string" ? src : src.src,
    alt,
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`
          group relative w-full overflow-hidden rounded-lg border border-border
          bg-card transition-all duration-300
          hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
          ${className}
        `}
      >
        <div
          className={`relative w-full overflow-hidden ${aspectClasses[aspectRatio]}`}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/0 transition-all duration-300 group-hover:bg-background/60">
            <div className="flex flex-col items-center gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
              <div className="rounded-full bg-primary/20 p-3 backdrop-blur-sm">
                <svg
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

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[slide]}
        plugins={[Zoom]}
        render={{ slide: NextJsImage }}
        carousel={{ finite: true }}
        animation={{
          fade: 300,
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          scrollToZoom: true,
        }}
        styles={{
          container: {
            backgroundColor: "rgba(2, 6, 23, 0.95)",
            backdropFilter: "blur(12px)",
          },
          root: {
            "--yarl__color_backdrop": "rgba(2, 6, 23, 0.95)",
            "--yarl__color_button": "hsl(217.2 91.2% 59.8%)",
            "--yarl__color_button_active": "hsl(217.2 91.2% 69.8%)",
          } as React.CSSProperties,
        }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
          closeOnPullUp: true,
        }}
      />
    </>
  );
}

export default ImageLightbox;

