import React from "react";
import { BsFillGridFill } from "react-icons/bs";
import { FaListAlt, FaUsers, FaHeart } from "react-icons/fa";
import { RiMovie2Fill, RiLockPasswordLine, RiLogoutCircleLine } from "react-icons/ri";
import { HiViewGridAdd } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import Layout from "../../Layout/Layout";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutAction } from "../../Redux/Actions/userActions";
import toast from "react-hot-toast";
import { FaBell } from "react-icons/fa";

function SideBar({children}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector(
    (state) => state.userLogin
  );
  
  const logoutHandler = () => {
    dispatch(logoutAction());
    navigate("/login");
    toast.success("Logged out successfully");
  }

  const SideLinks = userInfo?.isAdmin ? 
    [
      {
        name: "Dashboard",
        link: "/dashboard",
        icon: BsFillGridFill,
      },
      {
        name: "Movies List", 
        link: "/movieslist",
        icon: FaListAlt,
      },
      {
        name: "Add Movie",
        link: "/addmovie",
        icon: RiMovie2Fill,
      },
      {
        name: "Push Notification",
        link: "/push-notification",
        icon: FaBell, // import { FaBell } from "react-icons/fa";
      },

      {
        name: "Categories",
        link: "/categories",
        icon: HiViewGridAdd,
      },
      {
        name: "Users",
        link: "/users",
        icon: FaUsers,
      },
      {
        name: "Update Profile",
        link: "/profile",
        icon: FiSettings,
      },
      {
        name: "Favorites Movies",
        link: "/favorites",
        icon: FaHeart,
      },
      {
        name: "Change Password",
        link: "/password",
        icon: RiLockPasswordLine,
      },
    ]  
  : userInfo ? 
    [
      {
        name: "Update Profile",
        link: "/profile",
        icon: FiSettings,
      },
      {
        name: "Favorites Movies",
        link: "/favorites",
        icon: FaHeart,
      },
      {
        name: "Change Password",
        link: "/password",
        icon: RiLockPasswordLine,
      },
    ]
  : [];

  const active = "bg-customPurple text-white"
  const hover = "hover:text-white hover:bg-main"
  const inActive = "rounded font-medium text-sm above-1000:text-xs mobile:text-xs transitions flex gap-3 mobile:gap-2 items-center p-4 above-1000:p-3 mobile:p-2"
  const Hover = ({isActive}) =>
    isActive ? `${active} ${inActive}` : `${inActive} ${hover}`

  return (
    <Layout>
      <div className="min-h-screen container mx-auto px-2 mobile:px-0">
        <div className="xl:grid grid-cols-8 gap-10 above-1000:gap-8 mobile:gap-0 items-start md:py-12 py-6 above-1000:py-8 mobile:py-2">
          <div className="col-span-2 sticky bg-dry border border-gray-800 p-6 above-1000:p-4 mobile:p-3 rounded-md xl:mb-0 mb-5 mobile:mb-3">
            {
              // SideBar Links
              SideLinks.map((link, index) => (
                <NavLink to={link.link} key={index} className={Hover}>
                  <link.icon className="above-1000:text-sm mobile:text-xs" /> 
                  <p className="mobile:text-xs">{link.name}</p>
                </NavLink>
              ))     
            }
            <button onClick={logoutHandler} 
              className={`${inActive} ${hover} w-full`} >
              <RiLogoutCircleLine className="above-1000:text-sm mobile:text-xs" /> 
              <span className="mobile:text-xs">Log Out</span>
            </button>
          </div>
          <div
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="100"
            data-aos-offser="200"
            className="col-span-6 rounded-md bg-dry border border-gray-800 p-6 above-1000:p-4 mobile:p-3"
          >
            {children}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default SideBar;
