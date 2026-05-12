import Image from "next/image";
import { Project, projectPath } from "@/data/projectData";
import Link from "next/link";
import { ExternalLink, Github, FileCode, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type IProjectCardProps = {
  project: Project;
  index?: number;
};

const ProjectCard: React.FC<IProjectCardProps> = ({ project, index = 0 }) => {
  const detailHref = projectPath(project.name);
  // First row (lg:grid-cols-3) is above-the-fold on most viewports.
  const isAboveTheFold = index < 3;

  return (
    <Card className="flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary/50">
      {/* Image */}
      <Link
        href={detailHref}
        prefetch
        aria-label={`View details for ${project.title}`}
        className="relative block w-full h-48 rounded-t-xl overflow-hidden cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {project.image ? (
          <Image
            src={project.image}
            alt={`${project.title} screenshot`}
            fill
            placeholder="blur"
            priority={isAboveTheFold}
            loading={isAboveTheFold ? undefined : "lazy"}
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-secondary/30 to-secondary/50">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.18),transparent_70%)]"
            />
            <div className="relative flex flex-col items-center gap-2 text-muted-foreground transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em]">
                Preview Coming Soon
              </span>
            </div>
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-background/0 group-hover:bg-background/60 group-focus-visible:bg-background/60 transition-all duration-300 flex items-center justify-center"
        >
          <span className="text-sm font-medium text-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
            View Details →
          </span>
        </div>
      </Link>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{project.title}</CardTitle>
        <CardDescription>{project.previewDescription}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5">
          {project.projectTags.slice(0, 4).map((projectTag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {projectTag.title}
            </Badge>
          ))}
          {project.projectTags.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{project.projectTags.length - 4}
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Links */}
      <CardFooter className="flex flex-wrap gap-2 pt-0">
        {project.liveLink && (
          <Button variant="link" size="sm" asChild className="h-auto p-0">
            <Link
              href={project.liveLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.title} live site (opens in new tab)`}
            >
              <ExternalLink className="mr-1 h-3 w-3" aria-hidden="true" />
              Live
            </Link>
          </Button>
        )}
        {project.githubLink && (
          <Button variant="link" size="sm" asChild className="h-auto p-0 text-muted-foreground">
            <Link
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.title} GitHub repository (opens in new tab)`}
            >
              <Github className="mr-1 h-3 w-3" aria-hidden="true" />
              Code
            </Link>
          </Button>
        )}
        {project.smartContractLink && (
          <Button variant="link" size="sm" asChild className="h-auto p-0 text-muted-foreground">
            <Link
              href={project.smartContractLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.title} smart contract on Etherscan (opens in new tab)`}
            >
              <FileCode className="mr-1 h-3 w-3" aria-hidden="true" />
              Contract
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export { ProjectCard };
