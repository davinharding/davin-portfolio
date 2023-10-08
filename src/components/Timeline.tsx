// components/Timeline.tsx
import React from "react";
import { Chrono } from "react-chrono";
import { Fade } from "react-awesome-reveal";

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
      <Fade cascade>
        <Chrono
          theme={{
            primary: "#ffffff",
            secondary: "#7C3AED",
            cardBgColor: "#373B59",
            cardForeColor: "#ffffff",
            titleColor: "#D1D5DB",
          }}
          items={items}
          mode="VERTICAL_ALTERNATING"
          cardHeight={250}
          cardWidth={500}
          slideShow
          slideItemDuration={4500}
          slideShowType="reveal"
          scrollable={{ scrollbar: false }}
          hideControls
        />
      </Fade>
    </div>
  );
};

export default Timeline;
