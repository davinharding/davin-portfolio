import React from "react";
import { ProjectCard } from "./ProjectCard";
import { getPublishedProjects } from "@/data/projectData";
import { SectionHeading } from "./SectionHeading";

const ProjectsSection: React.FC = () => {
  return (
    <section className="section-spacing" id="projects" aria-labelledby="projects-heading">
      <div className="container-narrow">
        <SectionHeading
          title="Projects"
          subTitle="Selected work from my portfolio"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {getPublishedProjects().map((project, index) => (
            <ProjectCard key={project.name} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export { ProjectsSection };
