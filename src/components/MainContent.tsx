import { useState, useEffect } from "react";
import Background from "./Background";
import Image from "next/image";
import Button from "./Button";
import Link from "next/link";
import { Fade } from "react-awesome-reveal";

const MainContent: React.FC = () => {
  const words = [
    "Web3 dApps",
    "NFTs",
    "Web Apps",
    "Mint Pages",
    "E-commerce Stores",
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
    <>
      <Background>
      <Fade cascade={true}>
        <div className="flex items-center justify-center h-screen pb-14">
          <div className="flex flex-col-reverse lg:flex-row justify-between items-center w-10/12 lg:w-7/12">
            <div>
              <h1 className="lg:text-7xl text-3xl font-bold -left-5">
                Hi, {"I'm"} Davin.
              </h1>
              <h1 className="lg:text-7xl text-3xl font-bold">
                I build{" "}
                <span className={`inline-block`}>
                  <span
                    key={currentWord}
                    className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-slide pb-2"
                  >
                    {words[currentWord]}
                  </span>
                </span>
              </h1>{" "}
              <div className="text-sm lg:text-2xl">
                and am a skilled developer with over 5+ years of experience
                building web based software. My current focus is on web3 enabled
                decentralized applications. Schedule a call with me today and{" "}
                {"let's"} turn your ideas into reality!
              </div>
              <div className="flex justify-center top-10 max-h-fit pt-16 lg:pt-12">
                <Link href="/call">
                  <Button size="large" className="hover:border-transparent bg-transparent hover:bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                    Book a Call
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <button></button>
            </div>

            <Image
              src="/profile_picture.jpg"
              alt="Davin's Profile"
              width={325}
              height={300}
              className="rounded-full shadow-xl mt-16 lg:mt-0 h-56 w-56 lg:h-80 lg:w-80 shadow-gray-600 hover:animate-spinTowards animate-spinAway"
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
        </Fade>
      </Background>
    </>
  );
};

export default MainContent;
