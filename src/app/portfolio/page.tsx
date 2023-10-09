"use client";
import Background from "@/components/Background";
import Layout from "@/components/Layout";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

const About = () => (
  <Layout>
    <div className="min-h-screen relative">
      <Background>
          <div className="absolute top-28 left-8 text-4xl font-bold">
            Portfolio
          </div>

          <div className="absolute bottom-8 left-24">
            <Link href="/">
              <FontAwesomeIcon icon={faArrowLeft} className="text-md" />
            </Link>
          </div>
      </Background>
    </div>
  </Layout>
);

export default About;
