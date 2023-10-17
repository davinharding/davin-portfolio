// pages/index.tsx

"use client";

import ScrollArrow from "@/components/ScrollArrow";
import MainContent from "../components/MainContent";
import Timeline from "@/components/Timeline";
import Layout from "@/components/HeaderFooter";
import React from "react";
import { ParticlesContainer } from "@/components/ParticlesContainer";
import ProjectCard from "@/components/ProjectCard";
import SkillBadgeContainer from "@/components/SkillBadgeContainer";

const Home: React.FC = () => {
  return (
    <Layout page="index">
      <div className="relative bg-gray-900 text-white min-h-screen">
        <ParticlesContainer />
        <MainContent />
        <ScrollArrow />
      </div>
      <div className="bg-gradient-to-b from-slate-950   to-fuchsia-950">
        <SkillBadgeContainer />
        <Timeline />
      </div>
      {/* <ProjectCard /> */}
    </Layout>
  );
};

export default Home;
