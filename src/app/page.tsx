// pages/index.tsx

"use client";

import ScrollArrow from "@/components/ScrollArrow";
import Header from "../components/Header";
import MainContent from "../components/MainContent";
import Timeline from "@/components/Timeline";

const Home: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Header />
      <MainContent />
      <ScrollArrow />
      <Timeline />
      {/* Add your timeline component and other content here */}
    </div>
  );
};

export default Home;
