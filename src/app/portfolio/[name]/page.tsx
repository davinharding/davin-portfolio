import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Github, FileCode, Play } from "lucide-react";

import ContainerLayout from "@/components/ContainerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getPublishedProjects,
  projects,
  type Project,
} from "@/data/projectData";

import { ProjectGallery } from "./ProjectGallery";
import { ProjectHero } from "./ProjectHero";

type RouteParams = { name: string };
type RouteParamsPromise = Promise<RouteParams>;

// Pre-render every published portfolio detail page at build time so
// navigations are served as static HTML and prefetching works end-to-end.
// Draft projects are skipped here (and are absent from listings/sitemap), but
// their detail route still resolves so they can be previewed by direct URL.
export function generateStaticParams(): RouteParams[] {
  return getPublishedProjects().map((project) => ({
    name: encodeURI(project.name),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: RouteParamsPromise;
}): Promise<Metadata> {
  const { name } = await params;
  const project = findProject(name);
  if (!project) return { title: "Project Not Found" };
  const ogImage = project.image?.src;
  const slug = encodeURI(project.name);
  return {
    title: project.title,
    description: project.previewDescription,
    alternates: { canonical: `/portfolio/${slug}` },
    // Draft projects are accessible by direct URL for preview but should
    // never be indexed or followed by crawlers.
    ...(project.draft && {
      robots: { index: false, follow: false, nocache: true },
    }),
    openGraph: {
      type: "article",
      title: project.title,
      description: project.previewDescription,
      url: `/portfolio/${slug}`,
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

function findProject(rawName: string): Project | undefined {
  return projects.find((p) => p.name === decodeURI(rawName));
}

const PortfolioProjectDetail = async ({
  params,
}: {
  params: RouteParamsPromise;
}) => {
  const { name } = await params;
  const project = findProject(name);

  if (!project) {
    notFound();
  }

  return (
    <ContainerLayout pageTitle={project.name} mobile={true}>
      <div className="max-w-4xl">
        {/* Hero screenshot — leads with the most eye-catching asset */}
        {project.image && <ProjectHero project={project} />}

        {/* Links */}
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
        {project.description && (
          <div className="prose prose-invert prose-slate max-w-none mb-12">
            {project.description.split("|").map((paragraph, idx) => (
              <p key={idx} className="text-muted-foreground leading-relaxed mb-4">
                {paragraph.trim()}
              </p>
            ))}
          </div>
        )}

        {/* Additional screenshots — hero already shows image #1 */}
        {project.image2 && <ProjectGallery project={project} skip={1} />}
      </div>
    </ContainerLayout>
  );
};

export default PortfolioProjectDetail;
