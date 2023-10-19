import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface ButtonProps {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  className?: string;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  size = "medium",
  className = "",
  loading = false,
}) => {
  let paddingSize, textSize;

  switch (size) {
    case "small":
      paddingSize = "px-2 py-1";
      textSize = "text-sm";
      break;
    case "large":
      paddingSize = "px-6 py-3";
      textSize = "text-lg";
      break;
    default:
      paddingSize = "px-4 py-2";
      textSize = "text-base";
      break;
  }

  return (
    <button
      onClick={onClick}
      className={`border rounded-md border-white text-white hover:text-black ${paddingSize} ${textSize} ${className} transition-all duration-400 ease-in-out relative`}
    >
      {loading && (
        <span className="absolute left-3">
          <LoadingSpinner />
        </span>
      )}
      <span className={`${loading ? "ml-4" : ""}`}>{children}</span>
    </button>
  );
};

export default Button;
