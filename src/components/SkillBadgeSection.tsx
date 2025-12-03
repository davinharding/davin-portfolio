"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SkillData, skillBadgeData } from "@/data/skillBadgeData";
import { SectionHeading } from "./SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Organize skills into categories
const skillCategories: { title: string; skills: string[] }[] = [
  {
    title: "Core Stack",
    skills: [
      "TypeScript",
      "JavaScript",
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "TailwindCSS",
      "MaterialUI",
    ],
  },
  {
    title: "AI & LLMs",
    skills: ["OpenAI", "Anthropic", "LangChain"],
  },
  {
    title: "Cloud & DevOps",
    skills: [
      "AWS Suite",
      "Firebase",
      "Vercel",
      "Supabase",
      "Serverless",
      "Postgres",
      "Dynamodb",
    ],
  },
  {
    title: "Web3 & Blockchain",
    skills: ["Solidity", "Ethers.js", "web3js", "Hardhat", "IPFS", "Arweave"],
  },
  {
    title: "Payments & Tools",
    skills: ["Stripe", "Shopify", "NPM", "Jest"],
  },
];

// Get skill data by name
const getSkillByName = (name: string): SkillData | undefined => {
  return skillBadgeData.find((skill) => skill.name === name);
};

const SkillBadgeSection: React.FC = () => {
  return (
    <div className="section-spacing" id="skills">
      <div className="container-narrow">
        <SectionHeading
          title="Technologies"
          subTitle="Tools and services I work with"
        />
        <div className="grid gap-6 md:grid-cols-2">
          {skillCategories.map((category) => (
            <Card key={category.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skillName) => {
                    const skill = getSkillByName(skillName);
                    if (!skill) return null;
                    return (
                      <Link
                        key={skillName}
                        href={skill.link}
                        target="_blank"
                      >
                        <Badge
                          variant="secondary"
                          className="gap-2 hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                          <div className="relative h-4 w-4">
                            <Image
                              src={skill.image}
                              alt={skill.name}
                              fill={true}
                              className="object-contain"
                            />
                          </div>
                          {skill.name}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillBadgeSection;
