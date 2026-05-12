import type { Project } from "@/data/projectData";
import type { LightboxImage } from "@/components/ImageLightbox";

export function collectProjectImages(project: Project): LightboxImage[] {
  const images: LightboxImage[] = [];

  if (project.image) {
    images.push({
      src: project.image,
      alt: project.title,
      title: "Main Screenshot",
    });
  }
  if (project.image2) {
    images.push({
      src: project.image2,
      alt: `${project.title} - Screenshot 2`,
      title: "Screenshot 2",
    });
  }
  if (project.image3) {
    images.push({
      src: project.image3,
      alt: `${project.title} - Screenshot 3`,
      title: "Screenshot 3",
    });
  }
  if (project.image4) {
    images.push({
      src: project.image4,
      alt: `${project.title} - Screenshot 4`,
      title: "Screenshot 4",
    });
  }
  if (project.image5) {
    images.push({
      src: project.image5,
      alt: `${project.title} - Screenshot 5`,
      title: "Screenshot 5",
    });
  }

  return images;
}
