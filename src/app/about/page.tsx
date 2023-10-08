"use client";
import Background from "@/components/Background";
import Header from "@/components/Header";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

const About = () => (
  <div className="min-h-screen relative">
    {/* Uncomment the Header if you want it to be displayed */}
    <Header />

    <Background>
      <div className="absolute top-28 left-8 text-4xl font-bold">About Me</div>

      <div className="absolute bottom-8 left-24">
        <Link href="/">
          <FontAwesomeIcon icon={faArrowLeft} className="text-md" />
        </Link>
      </div>
    </Background>
  </div>
);

export default About;
