"use client";

import Image from "next/image";
import ContainerLayout from "@/components/ContainerLayout";
import { projects, Project } from "@/data/projectData";
import parse from 'html-react-parser';


const PortfolioProjectDetail = ({ params }: { params: { name: string } }) => {
  // Filter the project based on the name parameter.
  const project: Project | undefined = projects.find(
    (p) => p.name === decodeURI(params.name),
  );

  if (!project) {
    return (
      <ContainerLayout pageTitle="Project Not Found">
        Project Not Found
      </ContainerLayout>
    );
  }

  return (
    <ContainerLayout pageTitle={project.name} mobile={true}>
      <div className="lg:max-w-screen-xl flex lg:flex-row flex-col">
        <div className="flex-1 pr-6 my-6">
          <div>{parse(project.description as string)}</div>
        </div>

        <div className="flex flex-wrap flex-1">
          {project.image && (
            <Image
              src={project.image}
              alt={project.title}
              className="w-full mb-4 object-cover"
            />
          )}
          <div className="w-1/2 pr-2">
            {project.image2 && (
              <Image
                src={project.image2}
                alt={`${project.title} - 2`}
                className="w-full mb-4 object-cover"
              />
            )}
          </div>
          <div className="w-1/2 pl-2">
            {project.image3 && (
              <Image
                src={project.image3}
                alt={`${project.title} - 3`}
                className="w-full mb-4 object-cover"
              />
            )}
          </div>
          {project.image4 && (
            <Image
              src={project.image4}
              alt={`${project.title} - 4`}
              className="w-1/2 pr-2 mb-4 object-cover"
            />
          )}
          {project.image5 && (
            <Image
              src={project.image5}
              alt={`${project.title} - 5`}
              className="w-1/2 pl-2 mb-4 object-cover"
            />
          )}
        </div>
      </div>
    </ContainerLayout>
  );
};

export default PortfolioProjectDetail;
