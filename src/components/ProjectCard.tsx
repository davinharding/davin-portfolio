import Image from 'next/image';

interface CardProps {
  imageSrc: string;
  title: string;
  description: string;
  badges: string[];
  githubLink: string;
  demoLink: string;
}

const ProjectCard: React.FC<CardProps> = ({ imageSrc, title, description, badges=["test", "test2"], githubLink, demoLink }) => {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg transform transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl p-4">
      <div className="relative w-full h-48">
        <Image src={imageSrc} alt={title} layout="fill" objectFit="cover" className="rounded-t-xl" />
      </div>
      <div className="p-4">
        <h2 className="font-bold text-xl mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex flex-wrap mb-4">
          {badges.map((badge, index) => (
            <span key={index} className="bg-gray-200 text-gray-600 mr-2 mb-2 px-2 py-1 rounded-md text-sm">
              {badge}
            </span>
          ))}
        </div>
        <div className="flex justify-between">
          <a href={githubLink} className="text-blue-600 hover:underline">GitHub</a>
          <a href={demoLink} className="text-blue-600 hover:underline">Demo</a>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
