// components/Header.tsx

import { faBars, faHouse } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="fixed top-0 left-0 w-full bg-gray-800 text-white p-4 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={"/"}>DH</Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-4 bg-gray-800">
          <li>
            <Link href="/about">
              <button className="text-white hover:text-gray-400">About</button>
            </Link>
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
        <>
          <div className="fixed top-16 w-56 text-right">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                  Options
                  <FontAwesomeIcon icon={faHouse} />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1 ">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active
                              ? "bg-violet-500 text-white"
                              : "text-gray-900"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          {active ? (
                            <FontAwesomeIcon icon={faHouse} />
                          ) : (
                            <FontAwesomeIcon icon={faHouse} />
                          )}
                          Edit
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active
                              ? "bg-violet-500 text-white"
                              : "text-gray-900"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          {active ? (
                            <FontAwesomeIcon icon={faHouse} />
                          ) : (
                            <FontAwesomeIcon icon={faHouse} />
                          )}
                          Duplicate
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active
                              ? "bg-violet-500 text-white"
                              : "text-gray-900"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          {active ? (
                            <FontAwesomeIcon icon={faHouse} />
                          ) : (
                            <FontAwesomeIcon icon={faHouse} />
                          )}
                          Archive
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active
                              ? "bg-violet-500 text-white"
                              : "text-gray-900"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          {active ? (
                            <FontAwesomeIcon icon={faHouse} />
                          ) : (
                            <FontAwesomeIcon icon={faHouse} />
                          )}
                          Move
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active
                              ? "bg-violet-500 text-white"
                              : "text-gray-900"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          {active ? (
                            <FontAwesomeIcon icon={faHouse} />
                          ) : (
                            <FontAwesomeIcon icon={faHouse} />
                          )}
                          Delete
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
          {/* <div className="fixed top-10 right-0 h-full w-4/5 max-w-md transform ease-in-out atranslate-x-0 md:translate-x-full transition-transform duration-600 bg-gray-800 z-40">
            <ul className="flex flex-col space-y-2 p-4 bg-gray-800">
              <li>
                <Link href="/about">
                  <button
                    className="text-white hover:text-gray-400 w-full text-left"
                    onClick={() => setIsOpen(false)}
                  >
                    About
                  </button>
                </Link>
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
          </div> */}
        </>
      )}
    </div>
  );
};

export default Header;
