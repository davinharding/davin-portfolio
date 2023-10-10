"use client";
import ContainerLayout from "@/components/ContainerLayout";
import { InlineWidget } from "react-calendly";

const Call = () => (
  <ContainerLayout>
    <div className="absolute top-28 text-4xl font-bold container">
      Book a Call
      <div className="p-4">
        <InlineWidget url="https://calendly.com/davinharding/1-on-1-discovery-call?background_color=1a1a1a&text_color=ffffff&primary_color=ff0099" />
      </div>      
    </div>
  </ContainerLayout>
);

export default Call;
