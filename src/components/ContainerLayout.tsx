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
  mobile?: boolean;
};

const ContainerLayout: React.FC<ContainerLayoutProps> = ({
  children,
  pageTitle,
  mobile,
}) => (
  <HeaderFooter page="test" mobile={mobile}>
    <div className="bg-gray-900">
      <Background noMouseMovement>
        <div className="min-h-screen flex flex-col items-center mt-28">
          <div className="text-4xl font-bold container mx-4">
            <div>{pageTitle}</div>
            <div className="container">{children}</div>
          </div>

          <div className="flex bottom-2 lg:bottom-8 text-2xl container">
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
