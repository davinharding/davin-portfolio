import React from "react";
import SkillBadge from "./SkillBadge";
import { SkillData, skillBadgeData } from "@/data/skillBadgeData";
import { Fade } from "react-awesome-reveal";
import { SectionHeading } from "./SectionHeading";

const SkillBadgeSection: React.FC = () => {
  return (
    <div className="p-4 container mx-auto">
      <SectionHeading
        title="Technologies"
        subTitle="and services that I have expertise in"
      />
      <div className="flex flex-wrap justify-center gap-4">
        {skillBadgeData.map((skill: SkillData, index) => (
          <Fade key={index} cascade={true} direction={"up"} triggerOnce>
            <SkillBadge key={index} skill={skill} />
          </Fade>
        ))}
      </div>
    </div>
  );
};

export default SkillBadgeSection;
