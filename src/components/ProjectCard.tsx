"use client";

import Image from "next/image";
import { Project } from "@/data/projectData";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Github, FileCode } from "lucide-react";
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
};

const ProjectCard: React.FC<IProjectCardProps> = ({ project }) => {
  const router = useRouter();

  return (
    <Card className="flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary/50">
      {/* Image */}
      <div
        onClick={() => router.push("/portfolio/" + project.name)}
        className="relative w-full h-48 rounded-t-xl overflow-hidden cursor-pointer group"
      >
        <Image
          src={project.image}
          alt={project.title}
          fill={true}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-all duration-300 flex items-center justify-center">
          <span className="text-sm font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View Details →
          </span>
        </div>
      </div>

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
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Live
            </Link>
          </Button>
        )}
        {project.githubLink && (
          <Button variant="link" size="sm" asChild className="h-auto p-0 text-muted-foreground">
            <Link
              href={project.githubLink}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              <Github className="mr-1 h-3 w-3" />
              Code
            </Link>
          </Button>
        )}
        {project.smartContractLink && (
          <Button variant="link" size="sm" asChild className="h-auto p-0 text-muted-foreground">
            <Link
              href={project.smartContractLink}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              <FileCode className="mr-1 h-3 w-3" />
              Contract
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export { ProjectCard };
