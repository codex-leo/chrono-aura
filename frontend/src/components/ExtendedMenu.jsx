import { X } from "lucide-react";
import { NavLink } from "react-router-dom";

const ExtendedMenu = (props) => {
  const setIsMenuActive = props.menuSetter;
  const isMenuActive = props.isMenuActive;

  const handleMenuClose = () => {
    if (!isMenuActive) {
      return;
    }
    setIsMenuActive(false);
    return;
  };
  return (
    <div className="fixed inset-x-0 top-18 z-100 bg-[#ffffff3c] p-5 backdrop-blur-2xl">
      <div>
        <div className="absolute right-5 top-2 cursor-pointer">
          <X
            onClick={() => {
              handleMenuClose();
            }}
          />
        </div>
        <nav className="flex flex-col gap-2 font-bold ">
          <NavLink to={"/login"} className={"border-b-2 mt-3"}>
            Login
          </NavLink>
          <NavLink to={"/signin"} className={"border-b-2 mt-3"}>
            Sign In
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default ExtendedMenu;
