import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const ScrollArrow: React.FC = () => {
  return (
    <div className="absolute bottom-5 left-0 w-full flex justify-center">
      <div className="animate-bounce text-3xl">
        <FontAwesomeIcon icon={faChevronDown} />
      </div>
      <style jsx>{`
        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-15px);
          }
          60% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default ScrollArrow;
