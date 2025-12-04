// MenuDrawer.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { BsCollectionPlay } from 'react-icons/bs';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { BiPhoneCall, BiInfoCircle } from 'react-icons/bi';
import { FaFacebook, FaMedium, FaTelegram, FaYoutube, FaHeart, FaUser } from 'react-icons/fa';
import { FiLogIn } from 'react-icons/fi';
import { TbChevronDown } from 'react-icons/tb';
import { useSelector } from 'react-redux';

function MenuDrawer({ drawerOpen, toggleDrawer }) {
  // Track which sub-menu is open on mobile
  const [openMenu, setOpenMenu] = useState('');
  
  // Get user info and favorites
  const { userInfo } = useSelector((state) => state.userLogin);
  const { likedMovies } = useSelector((state) => state.userGetFavoriteMovies);

  // Helper to toggle sub-menus
  const handleSubMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? '' : menuName);
  };

  // Main menu structure for mobile
  const mainLinks = [
    {
      name: 'Movies',
      link: '/movies',
      icon: BsCollectionPlay,
    },
    {
      name: 'Hollywood',
      icon: HiOutlineUserGroup,
      children: [
        {
          name: 'Hollywood (English)',
          link: '/movies?browseBy=Hollywood%20(English)',
        },
        {
          name: 'Hollywood (Hindi Dubbed)',
          link: '/movies?browseBy=Hollywood%20(Hindi%20Dubbed)',
        },
      ],
    },
    {
      name: 'Indian',
      icon: HiOutlineUserGroup,
      children: [
        {
          name: 'Bollywood',
          link: '/movies?browseBy=Bollywood',
        },
        {
          name: 'South Indian (Hindi Dubbed)',
          link: '/movies?browseBy=South%20Indian%20(Hindi%20Dubbed)',
        },
      ],
    },
    {
      name: 'Web Series',
      icon: HiOutlineUserGroup,
      children: [
        {
          name: 'Hollywood (English)',
          link: '/movies?browseBy=Hollywood%20(English)',
        },
        {
          name: 'Hollywood (Hindi Dubbed)',
          link: '/movies?browseBy=Hollywood%20(Hindi%20Dubbed)',
        },
        {
          name: 'Bollywood',
          link: '/movies?browseBy=Bollywood',
        },
      ],
    },
    {
      name: 'Browse By',
      icon: HiOutlineUserGroup,
      children: [
        {
          name: 'Pakistani Movies',
          link: '/movies?browseBy=Pakistani%20Movies',
        },
        {
          name: 'Indian Punjabi Movies',
          link: '/movies?browseBy=Indian%20Punjabi%20Movies',
        },
      ],
    },
    {
      name: 'About Us',
      link: '/about-us',
      icon: BiInfoCircle,
    },
    {
      name: 'Contact Us',
      link: '/contact-us',
      icon: BiPhoneCall,
    },
  ];

  const LinkDatas = [
    { icon: FaFacebook, link: 'https://www.facebook.com/zpunet' },
    { icon: FaMedium, link: 'https://medium.com/@irenemmassyy' },
    { icon: FaTelegram, link: 'https://t.me/zpunet' },
    { icon: FaYoutube, link: 'https://www.youtube.com/channel/' },
  ];

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-all duration-300 ${
        drawerOpen ? 'visible' : 'invisible'
      }`}
    >
      {/* Background overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          drawerOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={toggleDrawer}
      />

      {/* Drawer content */}
      <div
        className={`absolute top-0 left-0 h-full w-[280px] bg-dry transform transition-transform duration-300 overflow-y-auto ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with logo and close button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link to="/" onClick={toggleDrawer}>
            <img
              src="/images/MOVIEFROST.png"
              alt="MovieFrost Logo"
              width={150}
              height={40}
              className="h-10 object-contain"
            />
          </Link>
          <button
            onClick={toggleDrawer}
            className="w-10 h-10 flex-colo text-customPurple hover:bg-main rounded-full transitions"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* User Account Section - Login/Profile & Favourites */}
        <div className="p-4 border-b border-border bg-main">
          <p className="text-xs text-dryGray uppercase mb-3 font-semibold">Account</p>
          {userInfo ? (
            // Logged in user - show profile and favourites
            <div className="space-y-2">
              <Link
                to="/profile"
                onClick={toggleDrawer}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-dry hover:bg-customPurple transitions text-white"
              >
                {userInfo.image ? (
                  <img
                    src={userInfo.image}
                    alt={userInfo.fullName}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-customPurple flex-colo">
                    <FaUser className="text-sm" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userInfo.fullName}</p>
                  <p className="text-[10px] text-dryGray">View Profile</p>
                </div>
              </Link>
              <Link
                to="/favorites"
                onClick={toggleDrawer}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-dry hover:bg-customPurple transitions text-white"
              >
                <div className="w-8 h-8 rounded-full bg-customPurple/20 flex-colo">
                  <FaHeart className="text-sm text-customPurple" />
                </div>
                <span className="text-sm">Favourites</span>
                {likedMovies?.length > 0 && (
                  <span className="ml-auto bg-customPurple text-white text-xs px-2 py-0.5 rounded-full">
                    {likedMovies.length}
                  </span>
                )}
              </Link>
              {userInfo.isAdmin && (
                <Link
                  to="/dashboard"
                  onClick={toggleDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-dry hover:bg-customPurple transitions text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-customPurple/20 flex-colo">
                    <HiOutlineUserGroup className="text-sm text-customPurple" />
                  </div>
                  <span className="text-sm">Dashboard</span>
                </Link>
              )}
            </div>
          ) : (
            // Not logged in - show login and register
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={toggleDrawer}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-customPurple hover:bg-customPurple/80 transitions text-white"
              >
                <FiLogIn className="text-lg" />
                <span className="text-sm font-medium">Login</span>
              </Link>
              <Link
                to="/register"
                onClick={toggleDrawer}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-dry border border-customPurple hover:bg-customPurple transitions text-white"
              >
                <FaUser className="text-lg" />
                <span className="text-sm font-medium">Register</span>
              </Link>
              <Link
                to="/favorites"
                onClick={toggleDrawer}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-dry hover:bg-customPurple transitions text-white"
              >
                <FaHeart className="text-lg text-customPurple" />
                <span className="text-sm">Favourites</span>
                <span className="text-[10px] text-dryGray ml-auto">(Login required)</span>
              </Link>
            </div>
          )}
        </div>

        {/* Menu Links */}
        <nav className="p-4">
          <p className="text-xs text-dryGray uppercase mb-3 font-semibold">Navigation</p>
          <ul className="space-y-1">
            {mainLinks.map((item, index) => (
              <li key={index}>
                {!item.children ? (
                  // Single link
                  <Link
                    to={item.link}
                    onClick={toggleDrawer}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-main transitions text-white"
                  >
                    {item.icon && <item.icon className="text-customPurple" />}
                    <span className="text-sm">{item.name}</span>
                  </Link>
                ) : (
                  // Has children => Submenu
                  <div>
                    <button
                      onClick={() => handleSubMenu(item.name)}
                      className="flex items-center justify-between w-full px-3 py-2.5 rounded-md hover:bg-main transitions text-white"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon && <item.icon className="text-customPurple" />}
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <TbChevronDown
                        className={`text-lg transition-transform duration-200 ${
                          openMenu === item.name ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {/* Sub links */}
                    {openMenu === item.name && (
                      <ul className="ml-6 mt-1 space-y-1 border-l border-border pl-3">
                        {item.children.map((child, idx) => (
                          <li key={idx}>
                            <Link
                              to={child.link}
                              onClick={toggleDrawer}
                              className="block px-3 py-2 text-sm text-dryGray hover:text-customPurple transitions"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Social Media Links */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-dryGray uppercase mb-3 font-semibold">Follow Us</p>
          <div className="flex items-center gap-3">
            {LinkDatas.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 flex-colo bg-main rounded-full hover:bg-customPurple transitions text-white"
              >
                <item.icon className="text-lg" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuDrawer;
