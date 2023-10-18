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
import { Fade } from "react-awesome-reveal";
import Link from "next/link";

const Timeline: React.FC = () => {
  const generateFontAwesomeIcon = (icon: IconDefinition) => {
    return <FontAwesomeIcon icon={icon} />;
  };

  return (
    <div>
      <div className="p-4 container mx-auto">
        <Fade cascade={true} direction={"up"}>
          <div className="text-5xl font-bold mb-2">Experiences</div>
          <h2 className="text-lg mb-6 ml-2 lg:ml-4">
            both proffesional and educational
          </h2>
        </Fade>
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
