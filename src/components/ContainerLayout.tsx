"use client";

import React from "react";
import HeaderFooter from "@/components/HeaderFooter";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  <HeaderFooter page="container" mobile={mobile}>
    <div className="bg-background min-h-screen">
      <div className="container-narrow pt-24 pb-16">
        {/* Back Link */}
        <Button variant="ghost" asChild className="mb-8 -ml-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        {/* Page Title */}
        <h1 className="heading-hero mb-8">{pageTitle}</h1>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  </HeaderFooter>
);

export default ContainerLayout;
