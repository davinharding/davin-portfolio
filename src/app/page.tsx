// pages/index.tsx

"use client";

import ScrollArrow from "@/components/ScrollArrow";
import MainContent from "../components/MainContent";
import Timeline from "@/components/Timeline";
import Layout from "@/components/Layout";

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="bg-gray-900 text-white min-h-screen">
        <MainContent />
        <ScrollArrow />
        <Timeline />
      </div>
    </Layout>
  );
};

export default Home;
