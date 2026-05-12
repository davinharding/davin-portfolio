import type { Metadata } from "next";
import ContainerLayout from "@/components/ContainerLayout";
import { getPublishedProjects } from "@/data/projectData";
import { ProjectCard } from "@/components/ProjectCard";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected projects across AI, SaaS, full-stack web, and Web3 — built and shipped by Davin Harding.",
  alternates: { canonical: "/portfolio" },
};

export default function Portfolio() {
  return (
    <ContainerLayout pageTitle="Portfolio">
      <p className="text-muted-foreground mb-12 max-w-2xl">
        A collection of projects I&apos;ve built, from AI products and SaaS
        platforms to NFT smart contracts and full-stack applications.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {getPublishedProjects().map((project, index) => (
          <ProjectCard key={project.name} project={project} index={index} />
        ))}
      </div>
    </ContainerLayout>
  );
}
