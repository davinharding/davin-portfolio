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
    title: "AI & Agentic Systems",
    skills: ["OpenAI", "Anthropic", "Gemini", "LangChain", "Replicate"],
  },
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
    title: "Cloud & DevOps",
    skills: [
      "AWS Suite",
      "Firebase",
      "Vercel",
      "Supabase",
      "Clerk",
      "Sentry",
      "Serverless",
      "Postgres",
      "Dynamodb",
    ],
  },
  {
    title: "Payments & Tools",
    skills: ["Stripe", "Shopify", "NPM", "Jest"],
  },
  {
    title: "Web3 & Blockchain",
    skills: ["Solidity", "Ethers.js", "web3js", "Hardhat", "IPFS", "Arweave"],
  },
];

// Get skill data by name
const getSkillByName = (name: string): SkillData | undefined => {
  return skillBadgeData.find((skill) => skill.name === name);
};

const SkillBadgeSection: React.FC = () => {
  return (
    <section
      className="section-spacing"
      id="skills"
      aria-labelledby="skills-heading"
    >
      <div className="container-narrow">
        <SectionHeading
          id="skills-heading"
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
                        rel="noopener noreferrer"
                      >
                        <Badge
                          variant="secondary"
                          className="gap-2 hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                          <div className="relative h-4 w-4">
                            <Image
                              src={skill.image}
                              alt={skill.name}
                              fill
                              sizes="16px"
                              loading="lazy"
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
    </section>
  );
};

export default SkillBadgeSection;
