import React from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { timelineData } from "@/data/timelineData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition, library } from "@fortawesome/fontawesome-svg-core";
import { TimelineElement } from "@/data/timelineData";

const Timeline: React.FC = () => {
  const generateFontAwesomeIcon = (icon: IconDefinition) => {
    return <FontAwesomeIcon icon={icon} />;
  };

  return (
    <div className="bg-gradient-to-b from-slate-950   to-fuchsia-950">
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
                <h4 className="vertical-timeline-element-subtitle">
                  {item.orgAndLocation}
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
