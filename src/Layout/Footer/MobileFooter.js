// MobileFooter.js
import React, { useContext } from 'react';
import { BsCollectionPlay } from 'react-icons/bs';
import { CgMenuBoxed } from 'react-icons/cg';
import { FiHeart, FiUserCheck } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import MenuDrawer from '../../Components/Drawer/MenuDrawer';
import { SidebarContext } from '../../Context/DrawerContext'; // from DrawerContext.js
import { useSelector } from 'react-redux';

function MobileFooter() {
  const { mobileDrawer, toggleDrawer } = useContext(SidebarContext);
  const { likedMovies } = useSelector((state) => state.userGetFavoriteMovies);
  const { userInfo } = useSelector((state) => state.userLogin);

  // NavLink styling
  const active = `bg-white text-main`;
  const inActive = `transition duration-300 text-2xl flex-colo text-customPurple hover:bg-white hover:text-main rounded-md px-4 py-3`;

  return (
    <>
      {/* The side drawer for mobile menu */}
      <MenuDrawer drawerOpen={mobileDrawer} toggleDrawer={toggleDrawer} />

      {/* Bottom navigation bar (hidden on lg screens, visible on small) */}
      {/* Ensure fixed positioning and z-index are correct */}
      <footer className="lg:hidden fixed z-40 bottom-0 w-full px-1">
        <div className="bg-dry rounded-md flex-btn w-full p-1">
          <NavLink
            to="/movies"
            className={({ isActive }) =>
              isActive ? `${active} ${inActive}` : inActive
            }
          >
            <BsCollectionPlay />
          </NavLink>

          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              isActive ? `${active} ${inActive}` : inActive
            }
          >
            <div className="relative">
              <div className="w-5 h-5 flex-colo rounded-full text-xs bg-customPurple text-white absolute -top-5 -right-1">
                {likedMovies?.length > 0 ? likedMovies?.length : 0}
              </div>
              <FiHeart />
            </div>
          </NavLink>

          <NavLink
            to={
              userInfo
                ? userInfo.isAdmin
                  ? '/dashboard'
                  : '/profile'
                : '/login'
            }
            className={({ isActive }) =>
              isActive ? `${active} ${inActive}` : inActive
            }
          >
            <FiUserCheck />
          </NavLink>

          <button onClick={toggleDrawer} className={inActive}>
            <CgMenuBoxed />
          </button>
        </div>
      </footer>
    </>
  );
}

export default MobileFooter;
