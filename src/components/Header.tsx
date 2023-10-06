// components/Header.tsx

import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="fixed top-0 left-0 w-full bg-gray-800 text-white p-4 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div>DH</div>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-4">
          <li>
            <button className="text-white hover:text-gray-400">About</button>
          </li>
          <li>
            <button className="text-white hover:text-gray-400">
              Portfolio
            </button>
          </li>
          <li>
            <button className="text-white hover:text-gray-400">
              Book a Call
            </button>
          </li>
        </ul>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      {isOpen && (
        <div
          className="absolute top-10 right-0 transform translate-x-0 md:translate-x-full transition-transform duration-300 bg-gray-800 h-full w-1/4 z-40"
          style={{ maxWidth: "25%" }}
        >
          <ul className="flex flex-col space-y-2 p-4">
            <li>
              <button
                className="text-white hover:text-gray-400 w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                About
              </button>
            </li>
            <li>
              <button
                className="text-white hover:text-gray-400 w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                Portfolio
              </button>
            </li>
            <li>
              <button
                className="text-white hover:text-gray-400 w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                Book a Call
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Header;
