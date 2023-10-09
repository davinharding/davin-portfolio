// pages/index.tsx

"use client";

import ScrollArrow from "@/components/ScrollArrow";
import MainContent from "../components/MainContent";
import Timeline from "@/components/Timeline";
import Layout from "@/components/HeaderFooter";
import React from "react";
import { ParticlesContainer } from "@/components/Particles";

const Home: React.FC = () => {
  return (
    <Layout>
      <ParticlesContainer />
      <div className="bg-gray-900 text-white min-h-screen">
        <MainContent />
        <ScrollArrow />
        <Timeline />
      </div>
    </Layout>
  );
};

export default Home;
