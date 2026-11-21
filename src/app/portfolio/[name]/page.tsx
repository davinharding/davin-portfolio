import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Github, FileCode, Play } from "lucide-react";

import ContainerLayout from "@/components/ContainerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  findProjectBySegment,
  getPublishedProjects,
  projectPath,
} from "@/data/projectData";

import { ProjectGallery } from "./ProjectGallery";
import { ProjectHero } from "./ProjectHero";

type RouteParams = { name: string };
type RouteParamsPromise = Promise<RouteParams>;

export function generateStaticParams(): RouteParams[] {
  return getPublishedProjects().map((project) => ({
    name: project.name,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: RouteParamsPromise;
}): Promise<Metadata> {
  const { name } = await params;
  const project = findProjectBySegment(name);
  if (!project) return { title: "Project Not Found" };
  const ogImage = project.image?.src;
  const path = projectPath(project.name);
  return {
    title: project.title,
    description: project.previewDescription,
    alternates: { canonical: path },
    ...(project.draft && {
      robots: { index: false, follow: false, nocache: true },
    }),
    openGraph: {
      type: "article",
      title: project.title,
      description: project.previewDescription,
      url: path,
      ...(ogImage && { images: [{ url: ogImage, alt: project.title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.previewDescription,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

const PortfolioProjectDetail = async ({
  params,
}: {
  params: RouteParamsPromise;
}) => {
  const { name } = await params;
  const project = findProjectBySegment(name);

  if (!project) {
    notFound();
  }

  return (
    <ContainerLayout
      pageTitle={project.name}
      mobile={true}
      backHref="/work"
      backLabel="Back to Work"
    >
      <div className="max-w-4xl">
        {project.image && <ProjectHero project={project} />}

        <div className="flex flex-wrap gap-2 mb-6">
          {project.liveLink && (
            <Button asChild size="sm">
              <Link href={project.liveLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                View Live
              </Link>
            </Button>
          )}
          {project.githubLink && (
            <Button variant="outline" asChild size="sm">
              <Link href={project.githubLink} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" aria-hidden="true" />
                GitHub
              </Link>
            </Button>
          )}
          {project.smartContractLink && (
            <Button variant="outline" asChild size="sm">
              <Link href={project.smartContractLink} target="_blank" rel="noopener noreferrer">
                <FileCode className="mr-2 h-4 w-4" aria-hidden="true" />
                Smart Contract
              </Link>
            </Button>
          )}
          {project.demoLink && (
            <Button variant="outline" asChild size="sm">
              <Link href={project.demoLink} target="_blank" rel="noopener noreferrer">
                <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                Demo
              </Link>
            </Button>
          )}
        </div>

        {project.relatedLinks?.length ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {project.relatedLinks.map((relatedLink) => (
              <Button key={relatedLink.href} variant="outline" asChild size="sm">
                <Link
                  href={relatedLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                  {relatedLink.label}
                </Link>
              </Button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 mb-8">
          {project.projectTags.map((tag, idx) => (
            <Badge key={idx} variant="secondary">
              {tag.title}
            </Badge>
          ))}
        </div>

        <Separator className="mb-8" />

        {project.description && (
          <div className="prose prose-invert prose-slate max-w-none mb-12">
            {project.description.split("|").map((paragraph, idx) => (
              <p key={idx} className="text-muted-foreground leading-relaxed mb-4">
                {paragraph.trim()}
              </p>
            ))}
          </div>
        )}

        {project.capabilities?.length ? (
          <div className="mb-12">
            <h2 className="text-lg font-semibold mb-4">Capabilities</h2>
            <ul className="grid gap-2 sm:grid-cols-2 list-none pl-0">
              {project.capabilities.map((capability) => (
                <li
                  key={capability}
                  className="text-sm text-muted-foreground leading-relaxed before:content-['•'] before:mr-2 before:text-primary"
                >
                  {capability}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {project.image2 && <ProjectGallery project={project} skip={1} />}
      </div>
    </ContainerLayout>
  );
};

export default PortfolioProjectDetail;
