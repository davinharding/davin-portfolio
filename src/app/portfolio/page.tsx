"use client";

import ContainerLayout from "@/components/ContainerLayout";
import { projects } from "@/data/projectData";
import { ProjectCard } from "@/components/ProjectCard";

const Portfolio = () => (
  <ContainerLayout pageTitle="Portfolio">
    <p className="text-muted-foreground mb-12 max-w-2xl">
      A collection of projects I&apos;ve built, from NFT platforms and Web3 dApps
      to full-stack applications and smart contracts.
    </p>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard key={index} project={project} />
      ))}
    </div>
  </ContainerLayout>
);

export default Portfolio;
