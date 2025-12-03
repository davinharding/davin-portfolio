"use client";

import React from "react";
import { timelineData, TimelineElement } from "@/data/timelineData";
import Link from "next/link";
import { SectionHeading } from "./SectionHeading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Timeline: React.FC = () => {
  // Filter out the "start" marker (id: 6 with no summary)
  const filteredData = timelineData.filter((item) => item.summary);

  return (
    <div className="section-spacing" id="experience">
      <div className="container-narrow">
        <SectionHeading
          title="Experience"
          subTitle="Professional and educational background"
        />

        <div className="space-y-4">
          {filteredData.map((item: TimelineElement, index) => (
            <Card key={item.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{item.role}</CardTitle>
                    {item.orgAndLocation && (
                      <CardDescription>
                        <Link
                          href={item.link}
                          target="_blank"
                          className="hover:text-primary transition-colors"
                        >
                          {item.orgAndLocation}
                        </Link>
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {item.date}
                  </Badge>
                </div>
              </CardHeader>
              {item.summary && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.summary}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
