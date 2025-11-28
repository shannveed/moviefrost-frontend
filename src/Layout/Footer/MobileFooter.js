// MobileFooter.js
import React, { useContext } from 'react';
import { BsCollectionPlay } from 'react-icons/bs';
import { CgMenuBoxed } from 'react-icons/cg';
import { BiHomeAlt, BiCategory } from 'react-icons/bi';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import MenuDrawer from '../../Components/Drawer/MenuDrawer';
import { SidebarContext } from '../../Context/DrawerContext';
import { useSelector } from 'react-redux';

function MobileFooter() {
  const { mobileDrawer, toggleDrawer, activeMobileTab, setActiveMobileTab } = useContext(SidebarContext);
  const { userInfo } = useSelector((state) => state.userLogin);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  // Handle Home tab click
  const handleHomeClick = (e) => {
    e.preventDefault();
    if (isHomePage) {
      // Already on home, just switch tab
      setActiveMobileTab('home');
      window.scrollTo(0, 0);
    } else {
      // Navigate to home and set tab
      setActiveMobileTab('home');
      navigate('/');
    }
  };

  // Handle BrowseBy tab click
  const handleBrowseByClick = (e) => {
    e.preventDefault();
    if (isHomePage) {
      // Already on home, just switch tab
      setActiveMobileTab('browseBy');
      window.scrollTo(0, 0);
    } else {
      // Navigate to home and set tab
      setActiveMobileTab('browseBy');
      navigate('/');
    }
  };

  // NavLink styling - Updated with shorter height and customPurple colors
  const active = 'bg-customPurple text-white';
  const inActive = 'transition duration-300 text-xl flex-colo text-white hover:bg-customPurple hover:text-white rounded-md px-3 py-1.5';

  // Determine if Home tab is active
  const isHomeActive = isHomePage && activeMobileTab === 'home';
  // Determine if BrowseBy tab is active
  const isBrowseByActive = isHomePage && activeMobileTab === 'browseBy';

  return (
    <>
      {/* The side drawer for mobile menu */}
      <MenuDrawer drawerOpen={mobileDrawer} toggleDrawer={toggleDrawer} />

      {/* Bottom navigation bar (hidden on lg screens, visible on small) */}
      <footer className="lg:hidden fixed z-50 bottom-0 w-full px-1">
        <div className="bg-dry rounded-md flex-btn w-full p-1">
          {/* Home Tab */}
          <button
            onClick={handleHomeClick}
            className={isHomeActive ? `${active} ${inActive}` : inActive}
            aria-label="Home"
          >
            <div className="flex flex-col items-center">
              <BiHomeAlt className="text-lg" />
              <span className="text-[9px] mt-0.5">Home</span>
            </div>
          </button>

          {/* BrowseBy Tab */}
          <button
            onClick={handleBrowseByClick}
            className={isBrowseByActive ? `${active} ${inActive}` : inActive}
            aria-label="Browse By"
          >
            <div className="flex flex-col items-center">
              <BiCategory className="text-lg" />
              <span className="text-[9px] mt-0.5">BrowseBy</span>
            </div>
          </button>

          {/* Movies Tab */}
          <NavLink
            to="/movies"
            onClick={() => setActiveMobileTab('movies')}
            className={({ isActive }) =>
              isActive ? `${active} ${inActive}` : inActive
            }
            aria-label="Movies"
          >
            <div className="flex flex-col items-center">
              <BsCollectionPlay className="text-lg" />
              <span className="text-[9px] mt-0.5">Movies</span>
            </div>
          </NavLink>

          {/* Menu Tab */}
          <button
            onClick={toggleDrawer}
            className={inActive}
            aria-label="Menu"
          >
            <div className="flex flex-col items-center">
              <CgMenuBoxed className="text-lg" />
              <span className="text-[9px] mt-0.5">Menu</span>
            </div>
          </button>
        </div>
      </footer>
    </>
  );
}

export default MobileFooter;
