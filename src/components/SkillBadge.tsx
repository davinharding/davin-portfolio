import { SkillData } from "@/data/skillBadgeData";
import Image from "next/image";
import Link from "next/link";

type SkillBadgeProps = {
  skill: SkillData;
};

const SkillBadge: React.FC<SkillBadgeProps> = ({ skill }) => {
  return (
    <Link href={skill.link} target="_blank">
      <div className="flex items-center bg-gradient-to-r from-fuchsia-900 to-slate-800 p-4 rounded-lg shadow-md hover:shadow-xl m-2 transform hover:scale-110 transition-transform duration-500">
        <div className="relative h-6 w-6 lg:w-10 lg:h-10 mr-3">
          <Image
            src={skill.image}
            alt={skill.name}
            fill={true}
            className="object-contain"
          />
        </div>
        <span className="text-white font-semibold">{skill.name}</span>
      </div>
    </Link>
  );
};

export default SkillBadge;
