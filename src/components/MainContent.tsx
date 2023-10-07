// components/MainContent.tsx

import { useState, useEffect } from "react";
import Background from "./Background";

const MainContent: React.FC = () => {
  const words = [
    "Web3 dApps",
    "NFTs",
    "Mint Pages",
    "Smart Contracts",
    "Landing Pages",
  ];
  const [currentWord, setCurrentWord] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prevWord) => (prevWord + 1) % words.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Background>
      <div className="flex items-center justify-center h-screen">
        <div className="lg:w-5/12 w-9/12">
          <h1 className="lg:text-6xl text-2xl font-bold">Hi, I'm Davin.</h1>
          <h1 className="lg:text-6xl text-2xl font-bold">
            I build{" "}
            <span className={`inline-block`}>
              <span
                key={currentWord}
                className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-slide pb-4"
              >
                {words[currentWord]}
              </span>
            </span>
            .
          </h1>
        </div>

        <style jsx>{`
          @keyframes slide {
            from {
              transform: translateY(-100%);
            }
            to {
              transform: translateY(0);
            }
          }
          .animate-slide {
            animation: slide 0.4s forwards;
          }
        `}</style>
      </div>
    </Background>
  );
};

export default MainContent;
