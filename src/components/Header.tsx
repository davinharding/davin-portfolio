import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathName = usePathname();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  const navigationItems = [
    { label: "About", href: "/about" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Book a Call", href: "/call" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-full text-white p-2 shadow-md z-50 transition-all duration-300 ${
        isScrolled ? "bg-gray-800" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link href={"/"}>
          <Image src="/logo.png" alt="logo" width="45" height="45" />
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-4">
          {navigationItems.map((item) => (
            <li key={item.label} className="hover:scale-125 ease-in-out">
              <Link
                href={item.href}
                className={`text-white hover:text-gray-400 ${
                  pathName === item.href ? "border-b-2 border-white" : ""
                } hover:border-b-2 hover:border-gray-400 `}
              >
                <span className="scale-150">{item.label}</span>
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
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block w-full px-4 py-2 text-sm text-white hover:bg-gray-600 ${
                    pathName === item.href
                      ? "border-l-4 border-white pl-2"
                      : ""
                  }`}
                >
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
