import React from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { timelineData } from "@/data/timelineData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { TimelineElement } from "@/data/timelineData";
import Link from "next/link";
import { SectionHeading } from "./SectionHeading";

const Timeline: React.FC = () => {
  const generateFontAwesomeIcon = (icon: IconDefinition) => {
    return <FontAwesomeIcon icon={icon} />;
  };

  return (
    <div>
      <div className="p-4 container mx-auto">
        <SectionHeading
          title="Experience"
          subTitle="both proffesional and educational"
        />
      </div>
      <VerticalTimeline>
        {timelineData.map((item: TimelineElement) => (
          <VerticalTimelineElement
            key={item.id}
            contentStyle={item.contentStyle}
            contentArrowStyle={item.contentArrowStyle}
            iconStyle={item.iconStyle}
            icon={generateFontAwesomeIcon(item.icon)}
            date={item.date}
          >
            {item.summary ? (
              <>
                <h3 className="vertical-timeline-element-title">{item.role}</h3>
                <h4 className="vertical-timeline-element-subtitle text-slate-900 underline hover:text-slate-600 transition-colors duration-300">
                  <Link href={item.link}>{item.orgAndLocation}</Link>
                </h4>
                <p>{item.summary}</p>
              </>
            ) : (
              ""
            )}
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </div>
  );
};

export default Timeline;
