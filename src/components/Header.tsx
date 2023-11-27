import Link from "next/link";
import { Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Hamburger from "hamburger-react";
import { projects } from "@/data/projectData";
import { Disclosure } from "@headlessui/react";

type IHeaderProps = {
  page?: string;
  mobile?: boolean;
};

const Header: React.FC<IHeaderProps> = ({ page, mobile }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPortfolioSubMenuOpen, setIsPortfolioSubMenuOpen] =
    useState<boolean>(false);
  const pathName = usePathname();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState<boolean>(false);

  const navigationItems = [
    // { label: "About", href: "/about" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Book a Call", href: "/call" },
  ];

  useEffect(() => {
    const closeSlideout = (event: MouseEvent) => {
      if (!event.target) return;
      const target = event.target as Node;
      if (!document.querySelector(".portfolio-slideout")?.contains(target)) {
        setIsSlideoutOpen(false);
      }
    };

    document.addEventListener("mousedown", closeSlideout);

    let scrollValue = 200;
    if (mobile) {
      scrollValue = 50;
    }
    const handleScroll = () => {
      if (window.scrollY > scrollValue) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", closeSlideout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mobile]);

  return (
    <div
      className={`fixed top-0 w-full text-white p-4 z-50 transition-all duration-300 ${
        isScrolled ? "bg-fuchsia-950 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link href={"/"}>
          <Image src="/logo.png" alt="logo" width="45" height="45" />
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-4">
          {navigationItems.map((item) => {
            if (item.label === "Portfolio") {
              return (
                <li key={item.label} className="hover:scale-125 ease-in-out">
                  <span
                    onClick={() => setIsSlideoutOpen(!isSlideoutOpen)}
                    className={`text-white hover:text-gray-400 ${
                      pathName === item.href ? "border-b-2 border-white" : ""
                    } hover:border-b-2 hover:border-gray-400 cursor-pointer`}
                  >
                    {item.label}
                  </span>
                </li>
              );
            } else {
              return (
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
              );
            }
          })}
          {isSlideoutOpen && (
            <div className="absolute mt-8 bg-fuchsia-900 shadow-lg rounded py-3 portfolio-slideout">
              <ul className="pr-3">
                {projects.map((project, idx) => (
                  <Link
                    key={idx}
                    href={`/portfolio/${encodeURI(project.name)}`}
                  >
                    <li
                      key={project.name}
                      className="p-1 hover:bg-white hover:text-fuchsia-900 rounded-r-md"
                      onClick={() => setIsSlideoutOpen(!isSlideoutOpen)}
                    >
                      <span className="pl-3">{project.name}</span>
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
          )}
        </ul>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden relative">
          <button className="text-2xl" onClick={() => setIsOpen(!isOpen)}>
            <Hamburger toggled={isOpen} toggle={setIsOpen} />
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
            <div className="absolute -right-4 mt-4 w-48 py-2 bg-fuchsia-900 rounded-md shadow-xl z-10">
              {navigationItems.map((item) => (
                <div key={item.label}>
                  {item.label === "Portfolio" ? (
                    <div
                      onClick={() => {
                        setIsPortfolioSubMenuOpen(!isPortfolioSubMenuOpen);
                      }}
                      className={`block w-full px-4 py-2 text-sm text-white hover:bg-gray-600 ${
                        pathName === item.href
                          ? "border-l-4 border-white pl-2 rounded-none"
                          : ""
                      } hover:bg-white hover:text-fuchsia-900 rounded-r-md`}
                    >
                      {item.label}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => {
                        setIsOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-sm text-white hover:bg-gray-600 ${
                        pathName === item.href
                          ? "border-l-4 border-white pl-2 rounded-none"
                          : ""
                      } hover:bg-white hover:text-fuchsia-900 rounded-r-md`}
                    >
                      {item.label}
                    </Link>
                  )}

                  {item.label === "Portfolio" && isPortfolioSubMenuOpen && (
                    <div className="pl-4">
                      {projects.map((project, idx) => (
                        <Link
                          key={idx}
                          href={`/portfolio/${encodeURI(project.name)}`}
                        >
                          <span
                            className="block px-4 py-1 text-sm text-white hover:bg-gray-600 hover:bg-white hover:text-fuchsia-900 rounded-r-md"
                            onClick={() => setIsPortfolioSubMenuOpen(false)}
                          >
                            {project.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Transition>
        </div>
      </div>
    </div>
  );
};

export default Header;
