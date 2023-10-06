// components/Timeline.tsx

"use client";

import { faCircleDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const Timeline: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const endpointHeight = 30;
  const gap = 20;
  const maxDrawHeight = 1000 - endpointHeight - gap;

  useEffect(() => {
    // This code runs only in the browser
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    setPageHeight(document.documentElement.scrollHeight - window.innerHeight);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const drawHeight = (scrollY / pageHeight) * maxDrawHeight;

  return (
    <div className="relative mt-20 bg-gray-900">
      <motion.div
        className="absolute left-1/2 bg-gray-300"
        style={{ width: "2px" }}
        initial={{ height: 0 }}
        animate={{ height: drawHeight }}
      ></motion.div>

      {/* ... rest of your timeline items ... */}

      <div
        className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{ top: `${maxDrawHeight + endpointHeight}px` }}
      >
        <div className="bg-gray-900 w-6 h-6 flex items-center justify-center">
          <span className="inline-block text-center mx-auto text-xs">
            {" "}
            {/* Added mx-auto and made it inline-block */}
            <FontAwesomeIcon icon={faCircleDot} />
          </span>
        </div>
        <div className="text-center mt-2">Present</div>
      </div>
    </div>
  );
};

export default Timeline;
