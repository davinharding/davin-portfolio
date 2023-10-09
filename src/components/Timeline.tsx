// components/Timeline.tsx
import React from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

const items = [
  {
    title: "Event 1",
    cardTitle: "Card Title 1",
    cardSubtitle: "Card Subtitle 1",
    cardDetailedText: "Detailed description about Event 1.",
    id: 1,
  },
  {
    title: "Event 2",
    cardTitle: "Card Title 2",
    cardSubtitle: "Card Subtitle 2",
    cardDetailedText: "Detailed description about Event 2.",
    id: 2,
  },
  {
    title: "Event 1",
    cardTitle: "Card Title 1",
    cardSubtitle: "Card Subtitle 1",
    cardDetailedText: "Detailed description about Event 1.",
    id: 3,
  },
  {
    title: "Event 2",
    cardTitle: "Card Title 2",
    cardSubtitle: "Card Subtitle 2",
    cardDetailedText: "Detailed description about Event 2.",
    id: 4,
  },
  {
    title: "Event 1",
    cardTitle: "Card Title 1",
    cardSubtitle: "Card Subtitle 1",
    cardDetailedText: "Detailed description about Event 1.",
    id: 5,
  },
  {
    title: "Event 2",
    cardTitle: "Card Title 2",
    cardSubtitle: "Card Subtitle 2",
    cardDetailedText: "Detailed description about Event 2.",
    id: 6,
  },
  {
    title: "Event 1",
    cardTitle: "Card Title 1",
    cardSubtitle: "Card Subtitle 1",
    cardDetailedText: "Detailed description about Event 1.",
    id: 7,
  },
  {
    title: "Event 2",
    cardTitle: "Card Title 2",
    cardSubtitle: "Card Subtitle 2",
    cardDetailedText: "Detailed description about Event 2.",
    id: 8,
  },
  // Add more events as required
];

const Timeline: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(37, 39, 89, 0.8)",
      }}
    >
      <VerticalTimeline>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          contentStyle={{ background: "rgb(33, 150, 243)", color: "#fff" }}
          contentArrowStyle={{ borderRight: "7px solid  rgb(33, 150, 243)" }}
          date="2011 - present"
          iconStyle={{ background: "rgb(33, 150, 243)", color: "#fff" }}
        //   icon={<WorkIcon />}
        >
          <h3 className="vertical-timeline-element-title">Creative Director</h3>
          <h4 className="vertical-timeline-element-subtitle">Miami, FL</h4>
          <p>
            Creative Direction, User Experience, Visual Design, Project
            Management, Team Leading
          </p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          date="2010 - 2011"
          iconStyle={{ background: "rgb(33, 150, 243)", color: "#fff" }}
        //   icon={<WorkIcon />}
        >
          <h3 className="vertical-timeline-element-title">Art Director</h3>
          <h4 className="vertical-timeline-element-subtitle">
            San Francisco, CA
          </h4>
          <p>
            Creative Direction, User Experience, Visual Design, SEO, Online
            Marketing
          </p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          date="2008 - 2010"
          iconStyle={{ background: "rgb(33, 150, 243)", color: "#fff" }}
        //   icon={<WorkIcon />}
        >
          <h3 className="vertical-timeline-element-title">Web Designer</h3>
          <h4 className="vertical-timeline-element-subtitle">
            Los Angeles, CA
          </h4>
          <p>User Experience, Visual Design</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          date="2006 - 2008"
          iconStyle={{ background: "rgb(33, 150, 243)", color: "#fff" }}
        //   icon={<WorkIcon />}
        >
          <h3 className="vertical-timeline-element-title">Web Designer</h3>
          <h4 className="vertical-timeline-element-subtitle">
            San Francisco, CA
          </h4>
          <p>User Experience, Visual Design</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--education"
          date="April 2013"
          iconStyle={{ background: "rgb(233, 30, 99)", color: "#fff" }}
        //   icon={<SchoolIcon />}
        >
          <h3 className="vertical-timeline-element-title">
            Content Marketing for Web, Mobile and Social Media
          </h3>
          <h4 className="vertical-timeline-element-subtitle">Online Course</h4>
          <p>Strategy, Social Media</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--education"
          date="November 2012"
          iconStyle={{ background: "rgb(233, 30, 99)", color: "#fff" }}
        //   icon={<SchoolIcon />}
        >
          <h3 className="vertical-timeline-element-title">
            Agile Development Scrum Master
          </h3>
          <h4 className="vertical-timeline-element-subtitle">Certification</h4>
          <p>Creative Direction, User Experience, Visual Design</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--education"
          date="2002 - 2006"
          iconStyle={{ background: "rgb(233, 30, 99)", color: "#fff" }}
        //   icon={<SchoolIcon />}
        >
          <h3 className="vertical-timeline-element-title">
            Bachelor of Science in Interactive Digital Media Visual Imaging
          </h3>
          <h4 className="vertical-timeline-element-subtitle">
            Bachelor Degree
          </h4>
          <p>Creative Direction, Visual Design</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          iconStyle={{ background: "rgb(16, 204, 82)", color: "#fff" }}
        //   icon={<StarIcon />}
        />
      </VerticalTimeline>
    </div>
  );
};

export default Timeline;
