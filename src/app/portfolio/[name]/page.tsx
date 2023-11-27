"use client";

import Image, { StaticImageData } from "next/image";
import ContainerLayout from "@/components/ContainerLayout";
import { projects, Project } from "@/data/projectData";
import Link from "next/link";
import Button from "@/components/Button";

const PortfolioProjectDetail = ({ params }: { params: { name: string } }) => {
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
          <div>
            {(project.description as string).split("|").map((paragraph, idx) => {
              return (
                <div className="pb-4 text-lg" key={idx}>
                  {paragraph}
                </div>
              );
            })}
          </div>
          {project.liveLink && (
            <Link href={project.liveLink} target="_blank">
              <Button className="hover:border-transparent bg-transparent hover:bg-white m-2">
                Live
              </Button>
            </Link>
          )}
          {project.githubLink && (
            <Link href={project.githubLink} target="_blank">
              <Button className="hover:border-transparent bg-transparent hover:bg-white m-2">
                Github
              </Button>
            </Link>
          )}
          {project.demoLink && (
            <Link href={project.demoLink} target="_blank">
              <Button className="hover:border-transparent bg-transparent hover:bg-white m-2">
                Demo
              </Button>
            </Link>
          )}
          {project.smartContractLink && (
            <Link href={project.smartContractLink} target="_blank">
              <Button className="hover:border-transparent bg-transparent hover:bg-white m-2">
                Smart Contract
              </Button>
            </Link>
          )}
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
