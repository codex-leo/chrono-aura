import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import useMobileCheck from "../../hooks/useMobileCheck";
import { Menu } from "lucide-react";
import ExtendedMenu from "./ExtendedMenu";

const Navbar = () => {
  const isMobile = useMobileCheck();
  const [isMenuActive, setIsMenuActive] = useState(false);

  const handleMenuOpen = () => {
    if (isMenuActive) {
      return;
    }
    setIsMenuActive(true);
  };
  return (
    <>
      <nav className="flex w-full justify-between fixed top-0 z-30 bg-[#ffffff3c] p-5 text-lg backdrop-blur-md">
        <NavLink to={"/"} className={"font-bold font-serif"}>
          ChronoAura
        </NavLink>
        {isMobile ? (
          <div className="ml-auto cursor-pointer">
            {!isMenuActive && (
              <Menu
                onClick={() => {
                  handleMenuOpen();
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex">
            <div>
              <NavLink
                to={"/login"}
                className={({ isActive }) =>
                  isActive
                    ? "border-b-2 bg-[#ff9f0f53] p-2 rounded-2xl"
                    : "bg-[#ff9f0f] p-2 rounded-2xl"
                }
              >
                Login
              </NavLink>
            </div>
            <div>
              <NavLink
                to={"/signin"}
                className={({ isActive }) => (isActive ? "border-b-2" : "")}
              >
                Sign In
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      {isMobile && isMenuActive && (
        <ExtendedMenu
          menuSetter={setIsMenuActive}
          isMenuActive={isMenuActive}
        />
      )}
    </>
  );
};

export default Navbar;
