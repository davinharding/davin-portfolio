// pages/index.tsx

"use client";

import ScrollArrow from "@/components/ScrollArrow";
import MainContent from "../components/MainContent";
import Timeline from "@/components/Timeline";
import Layout from "@/components/HeaderFooter";
import React from "react";
import { ParticlesContainer } from "@/components/ParticlesContainer";

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="relative bg-gray-900 text-white min-h-screen">
        <ParticlesContainer />
        <MainContent />
        <ScrollArrow />
      </div>
      <Timeline />
    </Layout>
  );
};

export default Home;
