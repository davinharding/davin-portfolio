// components/ContainerLayout.tsx
import React from "react";
import Background from "@/components/Background";
import HeaderFooter from "@/components/HeaderFooter";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

type ContainerLayoutProps = {
  children: React.ReactNode;
  pageTitle: string;
};

const ContainerLayout: React.FC<ContainerLayoutProps> = ({ children, pageTitle }) => (
  <HeaderFooter page="test">
    <div className="bg-gray-900">
      <Background noMouseMovement>
        <div className="min-h-screen flex justify-center">
          <div className="absolute top-28 text-4xl font-bold container">
            <div className="ml-20">{pageTitle}</div>
            {children}
          </div>

          <div className="absolute bottom-2 lg:bottom-8 text-2xl container">
            <Link href="/">
              <FontAwesomeIcon icon={faArrowLeft} /> Back
            </Link>
          </div>
        </div>{" "}
      </Background>
    </div>
  </HeaderFooter>
);

export default ContainerLayout;
