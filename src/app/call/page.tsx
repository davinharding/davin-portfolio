"use client";

import ContainerLayout from "@/components/ContainerLayout";
import { InlineWidget } from "react-calendly";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";

const Call = () => (
  <ContainerLayout pageTitle="Book a Call" mobile={true}>
    <div className="max-w-3xl mx-auto">
      <p className="text-muted-foreground mb-8">
        Let&apos;s discuss your project, product, or idea. Schedule a time that
        works for you.
      </p>
      <Card>
        <CardContent className="p-0">
          <InlineWidget
            LoadingSpinner={() => (
              <div className="flex justify-center py-20">
                <LoadingSpinner styles="h-14 w-14" />
              </div>
            )}
            url="https://calendly.com/davinharding/1-on-1-discovery-call?background_color=020617&text_color=F9FAFB&primary_color=3B82F6"
            styles={{
              height: "650px",
            }}
          />
        </CardContent>
      </Card>
    </div>
  </ContainerLayout>
);

export default Call;
