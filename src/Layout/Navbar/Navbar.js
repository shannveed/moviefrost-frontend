// Navbar.js - Updated with page refresh for login/register navigation
import { trackSearch, trackGuestAction } from '../../utils/analytics';
import React, { useEffect, useState, useRef } from 'react';
import { CgUser } from 'react-icons/cg';
import { FaBell, FaHeart, FaSearch } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getDistinctBrowseByAction } from '../../Redux/Actions/MoviesActions';
import Axios from '../../Redux/APIs/Axios';
import { IoClose } from 'react-icons/io5';
import {
  clearNotifications,
  removeNotification,
  markNotificationAsRead,
} from '../../Redux/Actions/notificationsActions';

function NavBar() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.userLogin);
  const { likedMovies } = useSelector((state) => state.userGetFavoriteMovies);
  const { browseBy = [] } = useSelector((state) => state.browseByDistinct || {});

  // Notifications from Redux store
  const { notifications } = useSelector((state) => state.notifications) || { notifications: [] };

  const [relevantNotifications, setRelevantNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (userInfo) {
      const filtered = notifications.filter((notif) =>
        userInfo.isAdmin ? notif.forAdmin === true : notif.forAdmin === false
      );
      setRelevantNotifications(filtered);
      const count = filtered.filter(n => !n.read).length;
      setUnreadCount(count);
    } else {
      setRelevantNotifications([]);
      setUnreadCount(0);
    }
  }, [notifications, userInfo]);

  const [notifyOpen, setNotifyOpen] = useState(false);

  useEffect(() => {
    dispatch(getDistinctBrowseByAction());
  }, [dispatch]);

  const hollywoodBrowseBy = Array.isArray(browseBy) ? browseBy.filter((item) =>
    item && item.toLowerCase().includes('hollywood')
  ) : [];
  
  const indianBrowseBy = Array.isArray(browseBy) ? browseBy.filter((item) =>
    item && (item.toLowerCase().includes('bollywood') ||
    item.toLowerCase().includes('indian'))
  ) : [];
  
  const leftoverBrowseBy = Array.isArray(browseBy) ? browseBy.filter(
    (item) => item && !hollywoodBrowseBy.includes(item) && !indianBrowseBy.includes(item)
  ) : [];

  const hover = 'hover:text-customPurple transitions text-white';
  const Hover = ({ isActive }) => (isActive ? 'text-customPurple' : hover);

  // Updated function to handle auth navigation with page refresh
  const handleAuthNavigation = (path) => {
    if (window.location.pathname !== path) {
      window.location.href = path;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      trackSearch(search);
      
      if (!userInfo) {
        trackGuestAction('search', { search_term: search });
      }
      
      navigate(`/movies/${search}`);
      setSearch(search);
      setShowDropdown(false);
    } else {
      navigate(`/movies`);
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim().length >= 2) {
      setShowDropdown(true);
      try {
        const { data } = await Axios.get(
          `/movies?search=${value}&limit=5`
        );
        if (data && data.movies) {
          setSearchResults(data.movies.slice(0, 5));
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error(error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const toggleNotifyDropdown = () => {
    setNotifyOpen(!notifyOpen);
  };

  const handleClearNotifications = () => {
    dispatch(clearNotifications(userInfo?.isAdmin ? true : false));
    setNotifyOpen(false);
  };

  const handleRemoveSingleNotification = (id) => {
    dispatch(removeNotification(id));
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification.id));
    }
    if (notification.link) {
      navigate(notification.link);
    }
    setNotifyOpen(false);
  };

  const handleMoviesClick = (e) => {
    e.preventDefault();
    navigate('/movies');
    window.location.href = '/movies';
  };

  return (
    <div className="bg-main shadow-md sticky top-0 z-20">
      <div className="container mx-auto py-6 above-1000:py-4 px-8 mobile:px-0 mobile:py-3 lg:grid gap-10 above-1000:gap-8 grid-cols-7 justify-between items-center">
        {/* Logo Section */}
        <div className="hidden lg:block col-span-1">
          <Link to="/">    
            <img
              src="/images/MOVIEFROST.png"
              alt="logo"
              className="w-full h-11 above-1000:h-9 object-contain"
            />
          </Link>
        </div>

        {/* Search Form */}
        <div className="col-span-2 mobile:col-span-7 relative mobile:w-full" ref={dropdownRef}>
          <form
            onSubmit={handleSearch}
            className="w-full mobile:w-full text-sm above-1000:text-xs bg-black rounded mobile:rounded-none flex-btn gap-4 mobile:gap-2 border-2 border-customPurple "
          >
            <button
              type="submit"
              className="bg-customPurple w-12 above-1000:w-10 mobile:w-10 flex-colo h-11 above-1000:h-10 mobile:h-10 rounded-sm mobile:rounded-none text-white"
              aria-label="Search movies"
            >
              <FaSearch className="above-1000:text-sm mobile:text-base" aria-hidden="true" />
            </button>
            <input
              type="search"
              value={search}
              onChange={handleInputChange}
              placeholder="Search Movie Name"
              className="font-medium placeholder:text-border text-sm above-1000:text-xs mobile:text-sm w-11/12 mobile:w-full h-12 above-1000:h-10 mobile:h-10 bg-transparent border-none px-2 mobile:px-1 text-white"
            />
            {search && (
              <button
                type="button"
                className="pr-2 mobile:pr-1 text-customPurple hover:text-white"
                onClick={() => {
                  setSearch('');
                  setSearchResults([]);
                  setShowDropdown(false);
                  navigate('/movies');
                }}
              >
                <IoClose size={20} className="mobile:w-5 mobile:h-5" />
              </button>
            )}
          </form>

          {/* Dropdown Suggestions */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 mobile:left-0 top-full w-full mobile:w-full bg-black text-white border border-customPurple mobile:border-t-0 mobile:border-x-0 rounded mobile:rounded-none mt-1 mobile:mt-0 z-50 max-h-60 overflow-y-auto">
              {searchResults.map((movie) => (
                <Link
                  key={movie._id}
                  to={`/movie/${movie._id}`}
                  className="block px-4 mobile:px-3 py-2 mobile:py-3 hover:bg-gray-700 hover:text-customPurple mobile:border-b mobile:border-gray-800"
                  onClick={() => {
                    setShowDropdown(false);
                    setSearch('');
                  }}
                >
                  {movie.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden lg:flex col-span-4 font-medium text-sm above-1000:text-xs xl:gap-6 2xl:gap-10 justify-between items-center">
          {/* Movies */}
          <a href="/movies" onClick={handleMoviesClick} className={hover}>
            Movies
          </a>

          {/* Hollywood Dropdown */}
          <div className="relative group">
            <button className={`${hover} inline-flex items-center`} type="button">
              Hollywood
            </button>
            <div className="absolute left-0 top-full bg-black text-white above-1000:text-xs min-w-[180px] p-2 rounded shadow-md opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
              {hollywoodBrowseBy.length > 0 ? (
                hollywoodBrowseBy.map((item) => (
                  <NavLink
                    key={item}
                    to={`/movies?browseBy=${encodeURIComponent(item)}`}
                    className="block px-3 py-2 hover:text-customPurple"
                  >
                    {item}
                  </NavLink>
                ))
              ) : (
                <p className="px-3 py-2 text-sm opacity-80">No Hollywood data</p>
              )}
              <NavLink
                to="/movies?browseBy=Hollywood%20Web%20Series%20(Hindi%20Dubbed)"
                className="block px-3 py-2 hover:text-customPurple"
              >
                Hollywood Web Series (Hindi Dubbed)
              </NavLink>
            </div>
          </div>

          {/* Indian Dropdown */}
          <div className="relative group">
            <button className={`${hover} inline-flex items-center`} type="button">
              Indian
            </button>
            <div className="absolute left-0 top-full bg-black text-white  above-1000:text-xs min-w-[180px] p-2 rounded shadow-md opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
              {indianBrowseBy.length > 0 ? (
                indianBrowseBy.map((item) => (
                  <NavLink
                    key={item}
                    to={`/movies?browseBy=${encodeURIComponent(item)}`}
                    className="block px-3 py-2 hover:text-customPurple"
                  >
                    {item}
                  </NavLink>
                ))
              ) : (
                <p className="px-3 py-2 text-sm opacity-80">No Indian data</p>
              )}
              <NavLink
                to="/movies?browseBy=South%20Indian%20(Hindi%20Dubbed)"
                className="block px-3 py-2 hover:text-customPurple"
              >
                South Indian (Hindi Dubbed)
              </NavLink>
              <NavLink
                to="/movies?browseBy=Bollywood%20Web%20Series"
                className="block px-3 py-2 hover:text-customPurple"
              >
                Bollywood Web Series
              </NavLink>
            </div>
          </div>

          {/* Browse By leftover */}
          <div className="relative group">
            <button className={`${hover} inline-flex items-center`} type="button">
              Browse By
            </button>
            <div className="absolute left-0 top-full bg-black text-white above-1000:text-xs min-w-[200px] p-2 rounded shadow-md opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
              {leftoverBrowseBy.length > 0 ? (
                leftoverBrowseBy.map((item) => (
                  <NavLink
                    key={item}
                    to={`/movies?browseBy=${encodeURIComponent(item)}`}
                    className="block px-3 py-2 hover:text-customPurple"
                  >
                    {item}
                  </NavLink>
                ))
              ) : (
                <p className="px-3 py-2 text-sm opacity-80">No data</p>
              )}
              <NavLink
                to="/movies?browseBy=Pakistani%20Movies"
                className="block px-3 py-2 hover:text-customPurple"
              >
                Pakistani Movies
              </NavLink>
              <NavLink
                to="/movies?browseBy=Indian%20Punjabi%20Movies"
                className="block px-3 py-2 hover:text-customPurple"
              >
                Indian Punjabi Movies
              </NavLink>
              <NavLink
                to="/movies?browseBy=WWE%20Wrestling"
                className="block px-3 py-2 hover:text-customPurple"
              >
                WWE Wrestling
              </NavLink>
              <NavLink
                to="/movies?browseBy=Indian%20Award%20Shows"
                className="block px-3 py-2 hover:text-customPurple"
              >
                Indian Award Shows
              </NavLink>
            </div>
          </div>

          {/* Contact Us */}
          <NavLink to="/contact-us" className={Hover}>
            Contact Us
          </NavLink>

          {/* Notifications Icon & Dropdown */}
          <div className="relative">
            <button 
              className="relative" 
              onClick={toggleNotifyDropdown}
              aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
              aria-expanded={notifyOpen}
              aria-controls="notifications-dropdown"
            >
              <FaBell className="w-6 h-6 above-1000:w-5 above-1000:h-5 text-white" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="w-5 h-5 above-1000:w-4 above-1000:h-4 flex-colo rounded-full text-xs above-1000:text-[10px] bg-customPurple text-white absolute -top-3 -right-3" aria-label={`${unreadCount} unread notifications`}>
                  {unreadCount}
                </span>
              )}
            </button>
            {notifyOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-black border border-customPurple rounded shadow-xl z-50 p-2 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between px-2 mb-2">
                  <h4 className="text-sm font-semibold text-white">
                    Notifications
                  </h4>
                  {relevantNotifications.length > 0 && (
                    <button
                      onClick={handleClearNotifications}
                      className="text-xs text-subMain hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {relevantNotifications.length === 0 && (
                  <p className="text-sm text-border px-2 py-2">
                    No notifications
                  </p>
                )}
                {[...relevantNotifications].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).map((notif) => (
                  <div
                    key={notif.id}
                    className={`text-sm text-white px-2 py-2 border-b border-gray-700 last:border-b-0 flex justify-between items-start group ${!notif.read ? 'bg-gray-800/50' : ''}`}
                  >
                    <div
                      onClick={() => handleNotificationClick(notif)}
                      className={`cursor-pointer flex-grow mr-2 ${notif.read ? 'opacity-70' : ''}`}
                    >
                      {notif.message}
                    </div>
                    <button
                      onClick={() => handleRemoveSingleNotification(notif.id)}
                      className="text-xs text-gray-500 hover:text-red-500 ml-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove notification"
                    >
                      <IoClose size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile or Admin Dashboard - Updated to use handleAuthNavigation for login */}
          {userInfo ? (
            <NavLink
              to={userInfo?.isAdmin ? "/dashboard" : "/profile"}
              className={Hover}
              aria-label={`${userInfo.fullName} profile`}
            >
              <img
                src={userInfo?.image || "/images/profile-user (1).png"}
                alt={userInfo?.fullName}
                className="w-8 h-8 above-1000:w-6 above-1000:h-6 rounded-full border object-cover border-customPurple"
              />
            </NavLink>
          ) : (
            <button
              onClick={() => handleAuthNavigation('/login')}
              className={`${hover} cursor-pointer`}
              aria-label="Login"
            >
              <CgUser className="w-8 h-8 above-1000:w-6 above-1000:h-6" />
            </button>
          )}

          {/* Favorites */}
          <NavLink to="/favorites" className={`${Hover} relative`}>
            <FaHeart className="w-6 h-6 above-1000:w-5 above-1000:h-5" />
            <div className="w-5 h-5 above-1000:w-4 above-1000:h-4 flex-colo rounded-full text-xs above-1000:text-[10px] bg-customPurple text-white absolute -top-5 -right-1">
              {likedMovies?.length || 0}
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
