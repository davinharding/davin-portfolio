import Image from "next/image";
import { Project } from "@/data/projectData";
import Button from "./Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fade } from "react-awesome-reveal";

type IProjectCardProps = {
  project: Project;
};

const ProjectCard: React.FC<IProjectCardProps> = ({ project }) => {
  const router = useRouter();
  return (
    <Fade triggerOnce cascade={true} direction={"up"}>
      <div className="max-w-md mx-auto m-8 bg-gradient-to-r from-fuchsia-900 to-slate-800 rounded-xl shadow-lg transform transition-transform duration-200 hover:-translate-y-4 hover:shadow-xl">
        <div>
          <div
            onClick={() => router.push("/portfolio/" + project.name)}
            className="relative w-full h-72 group cursor-pointer"
          >
            <Image
              src={project.image}
              alt={project.title}
              fill={true}
              className="rounded-t-xl object-cover z-0 w-full"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 text-opacity-0 hover:text-opacity-100 text-transparent text-white">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-lg z-10 transition-scale duration-300 hover:scale-125">
                Learn More
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="font-bold text-xl mb-2">{project.title}</h2>
            <div className="text-white mb-4">{project.description}</div>{" "}
            {project.projectTags.map((projectTag, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-slate-600 text-white mr-2 mb-2 pr-2 py-1 rounded-md text-sm"
              >
                <div className="relative h-4 w-4 lg:w-10 lg:h-6 mx-2">
                  <Image
                    src={projectTag.icon}
                    alt={projectTag.title}
                    fill={true}
                    className="object-contain"
                  />
                </div>
                {projectTag.title}
              </span>
            ))}
            <div className="flex justify-between pt-4">
              {project.githubLink ? (
                <Link href={project.githubLink} target="_blank">
                  {" "}
                  <Button
                    className="hover:border-transparent bg-transparent hover:bg-white"
                    onClick={(e: React.MouseEvent<HTMLElement>) =>
                      e.stopPropagation()
                    }
                  >
                    GitHub
                  </Button>
                </Link>
              ) : (
                ""
              )}
              {project.demoLink ? (
                <Link href={project.demoLink} target="_blank">
                  <Button
                    className="hover:border-transparent bg-transparent hover:bg-white"
                    onClick={(e: React.MouseEvent<HTMLElement>) =>
                      e.stopPropagation()
                    }
                  >
                    Demo
                  </Button>
                </Link>
              ) : (
                ""
              )}
              {project.liveLink ? (
                <Link href={project.liveLink} target="_blank">
                  <Button
                    className="hover:border-transparent bg-transparent hover:bg-white"
                    onClick={(e: React.MouseEvent<HTMLElement>) =>
                      e.stopPropagation()
                    }
                  >
                    Live
                  </Button>
                </Link>
              ) : (
                ""
              )}
              {project.smartContractLink ? (
                <Link href={project.smartContractLink} target="_blank">
                  <Button
                    className="hover:border-transparent bg-transparent hover:bg-white"
                    onClick={(e: React.MouseEvent<HTMLElement>) =>
                      e.stopPropagation()
                    }
                  >
                    Smart Contract
                  </Button>
                </Link>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    </Fade>
  );
};

export { ProjectCard };
