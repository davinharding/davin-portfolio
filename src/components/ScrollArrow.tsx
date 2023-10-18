import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const ScrollArrow: React.FC = () => {
  return (
    <div className="absolute bottom-5 left-0 w-full flex justify-center">
      <div id="under-the-fold" className="animate-bounce text-3xl">
        <Link href="/#under-the-fold" scroll={false}>
          <FontAwesomeIcon icon={faChevronDown} />
        </Link>
      </div>
    </div>
  );
};

export default ScrollArrow;
