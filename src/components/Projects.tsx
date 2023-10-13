import ProjectCard from "./ProjectCard";

export const Projects = () => {
  <div className="flex">
    <ProjectCard
      imageSrc="/path_to_image.jpg"
      title="Web3UIKit"
      description="Open-source contributor to the Web3UIKit - Beautiful and lightweight UI components for web3 developers."
      badges={["Open-Source Contribution", "React", "TypeScript", "CSS"]}
      githubLink="#"
      demoLink="#"
    />
  </div>;
};
