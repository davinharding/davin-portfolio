import React from "react";
import SkillBadge from "./SkillBadge";
import { skillBadgeData } from "@/data/skillBadgeData";

const SkillBadgeContainer: React.FC = () => {
  return (
    <div className="p-4 container mx-auto">
      <div className="text-5xl font-bold mb-2">Technologies</div>
      <h2 className="text-lg mb-6 ml-2 lg:ml-4">
        and services that I have expertise in
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {skillBadgeData.map((skill, index) => (
          <SkillBadge key={index} name={skill.name} image={skill.image} />
        ))}
      </div>
    </div>
  );
};

export default SkillBadgeContainer;
