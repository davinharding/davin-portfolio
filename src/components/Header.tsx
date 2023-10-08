import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { Transition } from "@headlessui/react";
import { useState } from "react";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const navigationItems = [
    { label: 'About', href: '/about' },
    { label: 'Portfolio', href: '#' },
    { label: 'Book a Call', href: '#' },
  ];

  return (
    <div className="fixed top-0 left-0 w-full bg-gray-800 text-white p-4 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={"/"}>DH</Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-4">
          {navigationItems.map(item => (
            <li key={item.label}>
              <Link className="text-white hover:text-gray-400" href={item.href}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden relative">
          <button onClick={() => setIsOpen(!isOpen)}>
            <FontAwesomeIcon icon={faBars} />
          </button>

          {/* Mobile Menu Dropdown */}
          <Transition
            show={isOpen}
            enter="transition duration-200 transform ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition duration-150 transform ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="absolute right-0 mt-4 w-48 py-2 bg-gray-700 rounded-md shadow-xl z-10">
              {navigationItems.map(item => (
                <Link onClick={() => setIsOpen(false)} className="block w-full px-4 py-2 text-sm text-white hover:bg-gray-600" key={item.label} href={item.href}>
             
                    {item.label}
                </Link>
              ))}
            </div>
          </Transition>
        </div>
      </div>
    </div>
  );
};

export default Header;
