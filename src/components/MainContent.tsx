import { useState, useEffect } from "react";
import Background from "./Background";
import Image from "next/image";

const MainContent: React.FC = () => {
  const words = [
    "Web3 dApps",
    "NFTs",
    "Mint Pages",
    "Smart Contracts",
    "Landing Pages",
    "SaaS Platforms",
  ];
  const [currentWord, setCurrentWord] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prevWord) => (prevWord + 1) % words.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <Background>
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col-reverse lg:flex-row justify-between items-center w-9/12 lg:w-1/2">
          <div>
            <h1 className="lg:text-6xl text-2xl font-bold">
              Hi, {"I'm"} Davin.
            </h1>
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

          <Image
            src="/profile_picture.jpg"
            alt="Davin's Profile"
            width={300}
            height={325}
            // className="rounded-full h-28 lg:h-72 shadow-lg shadow-gray-600  transform transition-transform duration-300 my-6 lg:mt-0 lg:ml-6"
            className="rounded-full shadow-gray-600 scale-75"
          />
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
