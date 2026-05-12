"use client";

import { CSSProperties } from "react";
import Image from "next/image";
import Lightbox, { SlideImage } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import type { LightboxImage } from "@/components/ImageLightbox";

type LightboxCSSProperties = CSSProperties & {
  [key: `--yarl__${string}`]: string;
};

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
        style={{ objectFit: cover ? "cover" : "contain" }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
      />
    </div>
  );
}

interface LightboxModalProps {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  showThumbnails?: boolean;
}

export function LightboxModal({
  images,
  index,
  onClose,
  showThumbnails = true,
}: LightboxModalProps) {
  const slides: SlideImage[] = images.map((img) => ({
    src: typeof img.src === "string" ? img.src : img.src.src,
    alt: img.alt || "",
    title: img.title,
  }));

  return (
    <Lightbox
      open
      close={onClose}
      index={index}
      slides={slides}
      plugins={showThumbnails ? [Zoom, Counter, Thumbnails] : [Zoom, Counter]}
      render={{ slide: NextJsImage }}
      carousel={{ finite: images.length <= 1, preload: 2 }}
      animation={{ fade: 300, swipe: 300 }}
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
          "--yarl__thumbnails_container_background_color":
            "rgba(2, 6, 23, 0.8)",
          "--yarl__counter_container_background_color": "rgba(2, 6, 23, 0.7)",
        } as LightboxCSSProperties,
        toolbar: { backgroundColor: "transparent" },
        navigationPrev: {
          color: "hsl(217.2 91.2% 59.8%)",
          filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))",
          transform: "none",
          transition: "background-color 0.2s ease",
          borderRadius: "12px",
          padding: "8px",
        },
        navigationNext: {
          color: "hsl(217.2 91.2% 59.8%)",
          filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))",
          transform: "none",
          transition: "background-color 0.2s ease",
          borderRadius: "12px",
          padding: "8px",
        },
      }}
      controller={{
        closeOnBackdropClick: true,
        closeOnPullDown: true,
        closeOnPullUp: true,
      }}
    />
  );
}
