import type { StaticImageData } from "next/image";

export interface LightboxImage {
  src: string | StaticImageData;
  alt?: string;
  title?: string;
}
