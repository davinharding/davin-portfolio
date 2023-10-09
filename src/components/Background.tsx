import React, { useState } from "react";

type BackgroundProps = {
  children?: React.ReactNode;
  noMouseMovement?: boolean;
};

const Background: React.FC<BackgroundProps> = ({ children, noMouseMovement }) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (noMouseMovement) return;

    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;

    // Convert the cursor position to a value between -0.5 and 0.5
    const xPos = clientX / innerWidth - 0.5;
    const yPos = clientY / innerHeight - 0.5;

    // Set the state
    setX(xPos);
    setY(yPos);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-10"></div>

      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-gradient-to-bl bg-auto bg-no-repeat opacity-10 scale-120"
        style={{
          backgroundImage: "url(/abstract_shape_bg.svg)",
          transform: `
                        translate(${Math.round(x * 40)}px, ${Math.round(
                          y * 100,
                        )}px)
                        rotateX(${y * 60}deg) 
                        rotateY(${x * 60}deg)
                    `,
        }}
      ></div>

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
};

export default Background;
