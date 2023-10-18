import React from "react";
import SkillBadge from "./SkillBadge";
import { skillBadgeData } from "@/data/skillBadgeData";
import { Fade, Slide, Hinge, Roll, Zoom } from "react-awesome-reveal";

const SkillBadgeContainer: React.FC = () => {
  return (
    <div className="p-4 container mx-auto">
      <Fade cascade={true} direction={"up"}>
        <div className="text-5xl font-bold mb-2">Technologies</div>
        <h2 className="text-lg mb-6 ml-2 lg:ml-4">
          and services that I have expertise in
        </h2>
      </Fade>
      <div className="flex flex-wrap justify-center gap-4">
        {skillBadgeData.map((skill, index) => (
          <Fade key={index} cascade={true} direction={"up"}>
            <SkillBadge key={index} name={skill.name} image={skill.image} />
          </Fade>
        ))}
      </div>
    </div>
  );
};

export default SkillBadgeContainer;
