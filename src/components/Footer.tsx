import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";

const Footer: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear(),
  );

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto text-center">
        <div className="mb-4">
          <Link
            href="https://www.linkedin.com/in/davinharding/"
            className="mx-2 hover:text-blue-500"
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon icon={faLinkedin} size="2x" />
          </Link>
          <Link
            href="https://github.com/davinharding"
            className="mx-2 hover:text-gray-500"
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon icon={faGithub} size="2x" />
          </Link>
        </div>
        <p>&copy; {currentYear} Davin Harding</p>
      </div>
    </footer>
  );
};

export default Footer;
