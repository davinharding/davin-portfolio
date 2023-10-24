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
        <div className="flex flex-col items-center mt-20 lg:mt-28">
          <div className="container mx-4 px-4">
            <div className="text-4xl font-bold flex">{pageTitle}</div>
            <div
              className={`container text-xl  ${
                pageTitle === "Book a Call"
                  ? ""
                  : "flex justify-around lg:mt-12"
              } `}
            >
              {children}
            </div>
          </div>
          <div className="flex lg:-bottom-12 -bottom-20 text-2xl container pb-3">
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
