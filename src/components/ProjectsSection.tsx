import React from "react";
import ProjectCard from "./ProjectCard";
import { projects } from "../data/projectData"; // Import the data
import { Fade } from "react-awesome-reveal";

const ProjectsSection: React.FC = () => {
  return (
    <div className="p-4 container mx-auto">
      <Fade cascade={true} direction={"up"} triggerOnce>
        <div className="text-5xl font-bold mb-2">Projects</div>
        <h2 className="text-lg mb-6 ml-2 lg:ml-4">that I have built</h2>
      </Fade>
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
