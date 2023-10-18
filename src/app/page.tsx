// pages/index.tsx

"use client";

import ScrollArrow from "@/components/ScrollArrow";
import MainContent from "../components/MainContent";
import Timeline from "@/components/Timeline";
import Layout from "@/components/HeaderFooter";
import React from "react";
import { ParticlesContainer } from "@/components/ParticlesContainer";
import SkillBadgeSection from "@/components/SkillBadgeSection";
import { ProjectsSection } from "@/components/ProjectsSection";

const Home: React.FC = () => {
  return (
    <Layout page="index">
      <div className="relative bg-gray-900 text-white min-h-screen">
        <ParticlesContainer />
        <MainContent />
        <ScrollArrow />
      </div>
      <div className="bg-gradient-to-b from-slate-950   to-fuchsia-950">
        <SkillBadgeSection />
        <ProjectsSection />
        <Timeline />
      </div>
      {/* <ProjectCard /> */}
    </Layout>
  );
};

export default Home;
