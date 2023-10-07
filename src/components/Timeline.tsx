// components/Timeline.tsx
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef, MutableRefObject } from "react";

const useOnScreen = (ref: MutableRefObject<HTMLDivElement | null>) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    });
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isIntersecting;
};

type TimeLineItemProps = {
  title: string;
  direction: string;
};

const TimelineItem = (props: TimeLineItemProps) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref);

  useEffect(() => {
    if (onScreen) {
      controls.start("visible");
    }
  }, [controls, onScreen]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }}
      className={`flex ${
        props.direction === "left" ? "flex-row-reverse" : "flex-row"
      } items-center mb-12`}
    >
      <motion.div
        className="w-24 h-1 bg-gray-300"
        initial={{ width: 0 }}
        animate={controls}
        variants={{
          hidden: { width: 0 },
          visible: { width: "6rem" },
        }}
      />
      <motion.div className="mx-4 w-6 h-6 bg-gray-500 rounded-full"></motion.div>
      <motion.div className="w-1/3">
        <motion.h2 className="text-white">{props.title}</motion.h2>
        <motion.p className="text-white text-sm mt-2">
          Lorem ipsum content...
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

const Timeline: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Set initial pageHeight value
    setPageHeight(document.documentElement.scrollHeight - window.innerHeight);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Use the pageHeight from the state rather than directly accessing `document`
  const drawHeight = (scrollY / (pageHeight - window.innerHeight)) * 100;

  useEffect(() => {
    controls.start({ height: `${drawHeight}%` });
  }, [controls, drawHeight]);

  return (
    <div className="relative mt-20 bg-gray-900 p-10 h-screen">
      <motion.div
        className="absolute left-1/2 bg-gray-300"
        style={{ width: "6px" }}
        initial={{ height: "0%" }}
        animate={controls}
      />
      {[
        "Title #1",
        "Title #2",
        "Title #3",
        "Title #4",
        "Title #5",
        "Title #6",
        "Title #7",
      ].map((title, index) => (
        <TimelineItem
          title={title}
          direction={index % 2 === 0 ? "left" : "right"}
          key={index}
        />
      ))}
    </div>
  );
};

export default Timeline;
