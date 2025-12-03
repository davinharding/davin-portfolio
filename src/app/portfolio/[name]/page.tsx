"use client";

import ContainerLayout from "@/components/ContainerLayout";
import { projects, Project } from "@/data/projectData";
import Link from "next/link";
import { ExternalLink, Github, FileCode, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageLightbox, LightboxImage } from "@/components/ImageLightbox";

// Component to gather and display all project images in a lightbox gallery
function ProjectGallery({ project }: { project: Project }) {
  // Collect all available images
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

  // For single image, use single column; for 2+ use 2 columns
  const columns = images.length === 1 ? 1 : 2;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
        <svg
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
        Gallery
        <span className="text-sm text-muted-foreground font-normal">
          ({images.length} {images.length === 1 ? "image" : "images"})
        </span>
      </h3>
      <ImageLightbox
        images={images}
        columns={columns as 1 | 2}
        showThumbnails={images.length > 1}
      />
    </div>
  );
}

const PortfolioProjectDetail = ({ params }: { params: { name: string } }) => {
  const project: Project | undefined = projects.find(
    (p) => p.name === decodeURI(params.name)
  );

  if (!project) {
    return (
      <ContainerLayout pageTitle="Project Not Found">
        <p className="text-muted-foreground">
          The project you&apos;re looking for doesn&apos;t exist.
        </p>
      </ContainerLayout>
    );
  }

  return (
    <ContainerLayout pageTitle={project.name} mobile={true}>
      <div className="max-w-4xl">
        {/* Links */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.liveLink && (
            <Button asChild size="sm">
              <Link href={project.liveLink} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Live
              </Link>
            </Button>
          )}
          {project.githubLink && (
            <Button variant="outline" asChild size="sm">
              <Link href={project.githubLink} target="_blank">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Link>
            </Button>
          )}
          {project.smartContractLink && (
            <Button variant="outline" asChild size="sm">
              <Link href={project.smartContractLink} target="_blank">
                <FileCode className="mr-2 h-4 w-4" />
                Smart Contract
              </Link>
            </Button>
          )}
          {project.demoLink && (
            <Button variant="outline" asChild size="sm">
              <Link href={project.demoLink} target="_blank">
                <Play className="mr-2 h-4 w-4" />
                Demo
              </Link>
            </Button>
          )}
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-8">
          {project.projectTags.map((tag, idx) => (
            <Badge key={idx} variant="secondary">
              {tag.title}
            </Badge>
          ))}
        </div>

        <Separator className="mb-8" />

        {/* Description */}
        <div className="prose prose-invert prose-slate max-w-none mb-12">
          {(project.description as string).split("|").map((paragraph, idx) => (
            <p key={idx} className="text-muted-foreground leading-relaxed mb-4">
              {paragraph.trim()}
            </p>
          ))}
        </div>

        {/* Images with Lightbox */}
        {project.image && (
          <ProjectGallery project={project} />
        )}
      </div>
    </ContainerLayout>
  );
};

export default PortfolioProjectDetail;
