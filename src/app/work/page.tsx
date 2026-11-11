import type { Metadata } from "next";
import MainContent from "@/components/MainContent";
import Timeline from "@/components/Timeline";
import Layout from "@/components/HeaderFooter";
import SkillBadgeSection from "@/components/SkillBadgeSection";
import { ProjectsSection } from "@/components/ProjectsSection";

export const metadata: Metadata = {
  title: "Work",
  description:
    "I design, build, and ship production-grade AI and SaaS products. 8+ years of full-stack experience across agentic systems, Next.js, TypeScript, enterprise SaaS, and Web3.",
  alternates: { canonical: "/work" },
};

export default function Work() {
  return (
    <Layout page="work">
      <div className="bg-background text-foreground">
        <MainContent />
        <ProjectsSection />
        <SkillBadgeSection />
        <Timeline />
      </div>
    </Layout>
  );
}
