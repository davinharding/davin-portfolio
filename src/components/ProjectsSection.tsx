import React from "react";
import { ProjectCard } from "./ProjectCard";
import { projects } from "@/data/projectData";
import { SectionHeading } from "./SectionHeading";

const ProjectsSection: React.FC = () => {
  return (
    <div className="section-spacing" id="projects">
      <div className="container-narrow">
        <SectionHeading 
          title="Projects" 
          subTitle="Selected work from my portfolio" 
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export { ProjectsSection };
