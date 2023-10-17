import Image, { StaticImageData } from "next/image";

type SkillBadgeProps = {
  name: string;
  image: StaticImageData;
};

const SkillBadge: React.FC<SkillBadgeProps> = ({ name, image }) => {
  return (
    <div className="flex items-center bg-gradient-to-r from-fuchsia-900 to-slate-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 m-2">
      <div className="relative h-6 w-6 lg:w-10 lg:h-10 mr-3 overflow-hidden">
        <Image src={image} alt={name} fill={true} objectFit="contain" />
      </div>
      <span className="text-white font-semibold">{name}</span>
    </div>
  );
};

export default SkillBadge;
