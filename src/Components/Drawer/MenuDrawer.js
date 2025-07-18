// MenuDrawer.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { BsCollectionPlay } from 'react-icons/bs';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { BiPhoneCall } from 'react-icons/bi';
import { FaFacebook, FaMedium, FaTelegram, FaYoutube } from 'react-icons/fa';
import { TbChevronDown } from 'react-icons/tb';

function MenuDrawer({ drawerOpen, toggleDrawer }) {
  // Track which sub-menu is open on mobile
  const [openMenu, setOpenMenu] = useState('');

  // Helper to toggle sub-menus
  const handleSubMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? '' : menuName);
  };

  // UPDATED: Handle Movies link click
  const handleMoviesClick = () => {
    toggleDrawer();
    // Force navigation to movies page without parameters
    window.location.href = '/movies';
  };

  // Main menu structure for mobile
  const mainLinks = [
    {
      name: 'Movies',
      link: '/movies',
      icon: BsCollectionPlay,
      onClick: handleMoviesClick, // Add custom onClick
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
    // Overlay background (MenuDrawer uses absolute positioning or a parent Drawer?)
    <div
      className={`fixed inset-0 z-50 transition-transform duration-300 ${
        drawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={toggleDrawer}
      ></div>

      {/* Drawer content */}
      <div className="fixed top-0 left-0 w-screen h-full bg-main text-white">
        {/* Header with logo and close button */}
        <div className="flex items-center justify-between h-16 px-6 bg-dry">
          <Link onClick={toggleDrawer} to="/">
            <img
              src="/images/MOVIEFROST.png"
              alt="logo"
              className="w-24 h-24 rounded object-contain"
            />
          </Link>
          <button
            onClick={toggleDrawer}
            type="button"
            className="transition w-10 h-10 flex items-center justify-center text-base text-customPurple bg-white rounded-full hover:bg-gray-200"
          >
            <IoClose />
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 px-6 py-4 overflow-y-auto">
          <ul className="space-y-5">
            {mainLinks.map((item, index) => (
              <li key={index}>
                {!item.children ? (
                  // Single link
                  item.onClick ? (
                    // Custom onClick for Movies link
                    <button
                      onClick={item.onClick}
                      className="flex items-center transitions text-lg font-normal hover:text-customPurple w-full text-left"
                    >
                      <item.icon className="mr-4" />
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      to={item.link}
                      onClick={toggleDrawer}
                      className="flex items-center transitions text-lg font-normal hover:text-customPurple"
                    >
                      <item.icon className="mr-4" />
                      {item.name}
                    </Link>
                  )
                ) : (
                  // Has children => Submenu
                  <div className="flex flex-col">
                    <button
                      onClick={() => handleSubMenu(item.name)}
                      className="flex items-center justify-between w-full text-lg font-normal hover:text-customPurple"
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-4" />
                        {item.name}
                      </div>
                      <TbChevronDown
                        className={`transition-transform duration-300 ${
                          openMenu === item.name ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {/* Sub links */}
                    {openMenu === item.name && (
                      <ul className="ml-9 mt-2 space-y-2">
                        {item.children.map((child, idx) => (
                          <li key={idx}>
                            <Link
                              to={child.link}
                              onClick={toggleDrawer}
                              className="flex items-center transitions text-base font-normal hover:text-customPurple"
                            >
                              - {child.name}
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
        <div className="px-8 py-6 bg-dry">
          <div className="flex items-center justify-center space-x-5">
            {LinkDatas.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-colo w-10 h-10 transitions hover:bg-customPurple text-lg bg-white rounded bg-opacity-30"
              >
                <item.icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuDrawer;
