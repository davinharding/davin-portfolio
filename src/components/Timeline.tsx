import React from "react";
import { timelineData, TimelineElement } from "@/data/timelineData";
import Link from "next/link";
import { SectionHeading } from "./SectionHeading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Timeline: React.FC = () => {
  // Defensive filter so a future "marker" entry without a summary doesn't render
  const filteredData = timelineData.filter((item) => item.summary);

  return (
    <section
      className="section-spacing"
      id="experience"
      aria-labelledby="experience-heading"
    >
      <div className="container-narrow">
        <SectionHeading
          id="experience-heading"
          title="Experience"
          subTitle="Professional and educational background"
        />

        <ol className="space-y-4 list-none pl-0">
          {filteredData.map((item: TimelineElement) => (
            <li key={item.id}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{item.role}</CardTitle>
                      {item.orgAndLocation && item.link ? (
                        <CardDescription>
                          <Link
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {item.orgAndLocation}
                          </Link>
                        </CardDescription>
                      ) : item.orgAndLocation ? (
                        <CardDescription>{item.orgAndLocation}</CardDescription>
                      ) : null}
                    </div>
                    <Badge variant="outline" className="w-fit">
                      <time>{item.date}</time>
                    </Badge>
                  </div>
                </CardHeader>
                {item.summary && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {item.summary}
                    </p>
                  </CardContent>
                )}
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Timeline;
