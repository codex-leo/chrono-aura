import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <>
      <nav className="flex w-full bg-[#FFBF00] p-5 text-lg justify-between">
        <NavLink to={"/"} className={"font-bold font-serif"}>
          ChronoAura
        </NavLink>

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
      </nav>
    </>
  );
};

export default Navbar;
