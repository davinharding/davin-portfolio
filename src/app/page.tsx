'use client'

import MainContent from "@/components/MainContent";
import Timeline from "@/components/Timeline";
import Layout from "@/components/HeaderFooter";
import React from "react";
import SkillBadgeSection from "@/components/SkillBadgeSection";
import { ProjectsSection } from "@/components/ProjectsSection";
// import { GithubSection } from "@/components/GithubSection";

const Home: React.FC = () => {
  return (
    <Layout page="index">
      <div className="bg-background text-foreground">
        <MainContent />
        <ProjectsSection />
        <SkillBadgeSection />
        <Timeline />
        {/* <GithubSection /> */}
      </div>
    </Layout>
  );
};

export default Home;
