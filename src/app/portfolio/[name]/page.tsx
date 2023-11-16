"use client";

import Image, { StaticImageData } from "next/image";
import ContainerLayout from "@/components/ContainerLayout";
import { projects, Project } from "@/data/projectData";
import { useState } from "react";
import { Dialog } from "@headlessui/react";

const PortfolioProjectDetail = ({ params }: { params: { name: string } }) => {
//   const [isModalOpen, setModalOpen] = useState(false);
//   const [selectedImage, setSelectedImage] = useState<StaticImageData>();
  // Filter the project based on the name parameter.
  const project: Project | undefined = projects.find(
    (p) => p.name === decodeURI(params.name),
  );

//   const openModal = (imageSrc: StaticImageData) => {
//     setSelectedImage(imageSrc);
//     setModalOpen(true);
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//   };

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
            {(project.description as string).split("|").map((e, idx) => {
              return (
                <div className="pb-4 text-sm" key={idx}>
                  {e}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap flex-1">
          {project.image && (
            // <div onClick={() => openModal(project.image)}>
              <Image
                src={project.image}
                alt={project.title}
                className="w-full mb-4 object-cover"
              />
            // </div>
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

      {/* <Dialog
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        className="modal-style"
      >
        <Dialog.Overlay />
        <Dialog.Panel>
          <Image
            src={selectedImage as StaticImageData}
            alt="Selected Project Image"
            layout="fill"
          />
        </Dialog.Panel>
      </Dialog> */}
    </ContainerLayout>
  );
};

export default PortfolioProjectDetail;
