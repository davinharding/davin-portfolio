import React from "react";
import { ProjectCard } from "./ProjectCard";
import { projects } from "../data/projectData"; // Import the data
import { SectionHeading } from "./SectionHeading";

const ProjectsSection: React.FC = () => {
  return (
    <div className="p-4 container mx-auto">
      <SectionHeading title="Projects" subTitle="that I have built" />
      <div className="flex flex-wrap justify-center -mx-4">
        {projects.map((project, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3 px-4">
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </div>
  );
};

export { ProjectsSection };
