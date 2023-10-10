// components/ContainerLayout.tsx
import React from "react";
import Background from "@/components/Background";
import Layout from "@/components/HeaderFooter";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

type ContainerLayoutProps = {
  children: React.ReactNode;
};

const ContainerLayout: React.FC<ContainerLayoutProps> = ({ children }) => (
  <Layout>
    <div className="bg-gray-900">
      <Background noMouseMovement>
        <div className="min-h-screen flex justify-center">
          {children}

          <div className="absolute bottom-2 lg:bottom-8 text-2xl container">
            <Link href="/">
              <FontAwesomeIcon icon={faArrowLeft} /> Back
            </Link>
          </div>
        </div>{" "}
      </Background>
    </div>
  </Layout>
);

export default ContainerLayout;
