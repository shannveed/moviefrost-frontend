// Navbar.js
import { trackSearch, trackGuestAction } from '../../utils/analytics';
import React, { useEffect, useState, useRef } from 'react';
import { CgUser } from 'react-icons/cg';
import { FaBell, FaHeart, FaSearch } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getDistinctBrowseByAction } from '../../Redux/Actions/MoviesActions';
import Axios from '../../Redux/APIs/Axios';
import { IoClose } from 'react-icons/io5';
import toast from 'react-hot-toast';

import {
  clearNotifications,
  removeNotification,
  markNotificationAsRead,
  getNotificationsAction,
} from '../../Redux/Actions/notificationsActions';

// ✅ NEW
import { OPEN_WATCH_REQUEST_POPUP } from '../../utils/events';
import {
  ensurePushSubscription,
  requestPermissionAndSubscribe,
  isPushSupported,
} from '../../utils/pushNotifications';


function NavBar() {
  // Search
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Notifications dropdown
  const [notifyOpen, setNotifyOpen] = useState(false);
  const notifyRef = useRef(null);

  // Admin reply to watch request
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyLink, setReplyLink] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.userLogin || {});
  const { likedMovies = [] } = useSelector(
    (state) => state.userGetFavoriteMovies || {}
  );
  const { browseBy = [] } = useSelector((state) => state.browseByDistinct || {});

  // server-based notifications state
  const {
    notifications = [],
    unreadCount = 0,
    isLoading: notifLoading,
    isError: notifError,
  } = useSelector((state) => state.notifications || {});

  // Fetch distinct browseBy values
  useEffect(() => {
    dispatch(getDistinctBrowseByAction());
  }, [dispatch]);

  // Fetch notifications on login + poll
  useEffect(() => {
    if (!userInfo?.token) return;

    dispatch(getNotificationsAction(true));
    const id = setInterval(() => dispatch(getNotificationsAction(true)), 15000);

    return () => clearInterval(id);
  }, [dispatch, userInfo?.token]);

  // Notification errors
  useEffect(() => {
    if (notifError) toast.error(notifError);
  }, [notifError]);

  // Close notification dropdown on logout
  useEffect(() => {
    if (!userInfo?.token) {
      setNotifyOpen(false);
      setReplyOpenId(null);
      setReplyLink('');
      setReplyMessage('');
    }
  }, [userInfo?.token]);

  // Split browseBy lists
  const hollywoodBrowseBy = Array.isArray(browseBy)
    ? browseBy.filter((item) => item && item.toLowerCase().includes('hollywood'))
    : [];

  const indianBrowseBy = Array.isArray(browseBy)
    ? browseBy.filter(
        (item) =>
          item &&
          (item.toLowerCase().includes('bollywood') ||
            item.toLowerCase().includes('indian'))
      )
    : [];

  const leftoverBrowseBy = Array.isArray(browseBy)
    ? browseBy.filter(
        (item) =>
          item &&
          !hollywoodBrowseBy.includes(item) &&
          !indianBrowseBy.includes(item)
      )
    : [];

  const hover = 'hover:text-customPurple transitions text-white';
  const Hover = ({ isActive }) => (isActive ? 'text-customPurple' : hover);

  // Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    const term = search.trim();

    if (term) {
      if (!userInfo) {
        trackGuestAction('search', { search_term: term });
      }
      navigate(`/movies/${term}`);
      setShowDropdown(false);
    } else {
      navigate('/movies');
      setShowDropdown(false);
    }
  };

  // Search suggestions
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim().length >= 2) {
      setShowDropdown(true);
      try {
        const { data } = await Axios.get(
          `/movies?search=${encodeURIComponent(value)}&limit=5`
        );
        if (data && Array.isArray(data.movies)) {
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

  // Close dropdowns if click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // search dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }

      // notifications dropdown
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setNotifyOpen(false);
        setReplyOpenId(null);
        setReplyLink('');
        setReplyMessage('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifyDropdown = async () => {
  if (!userInfo?.token) {
    toast.error('Please login to view notifications');
    navigate('/login');
    return;
  }

  // ✅ NEW: Ask once per session (user gesture = bell click)
  try {
    if (isPushSupported()) {
      if (Notification.permission === 'granted') {
        await ensurePushSubscription(userInfo.token);
      } else if (Notification.permission === 'default') {
        const key = 'pushPermissionPrompted';
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          await requestPermissionAndSubscribe(userInfo.token);
        }
      }
    }
  } catch (e) {
    console.warn('[push] enable failed:', e);
  }

  setNotifyOpen((prev) => {
    const next = !prev;
    if (next) dispatch(getNotificationsAction(true));
    return next;
  });
};


  const handleClearNotifications = () => {
    dispatch(clearNotifications());
    setNotifyOpen(false);
    setReplyOpenId(null);
    setReplyLink('');
    setReplyMessage('');
  };

  const handleRemoveSingleNotification = (id) => {
    dispatch(removeNotification(id));
  };

  const handleNotificationClick = (notif) => {
    if (!notif) return;

    if (!notif.read) {
      dispatch(markNotificationAsRead(notif._id));
    }

    const link = notif.link;
    if (link) {
      if (link.startsWith('http')) {
        window.location.href = link;
      } else {
        navigate(link);
      }
    }

    setNotifyOpen(false);
    setReplyOpenId(null);
    setReplyLink('');
    setReplyMessage('');
  };

  // Always go to movies page 1
  const handleMoviesClick = (e) => {
    e.preventDefault();
    navigate('/movies');
    window.location.href = '/movies';
  };

  // ✅ NEW: Open Movie/WebSeries request popup from notifications UI
  const openWatchRequestPopup = () => {
    setNotifyOpen(false);
    setReplyOpenId(null);
    setReplyLink('');
    setReplyMessage('');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(OPEN_WATCH_REQUEST_POPUP));
    }
  };

  // Admin: reply to watch request
  const handleAdminReplyRequest = async (notif) => {
    const requestId = notif?.meta?.requestId;
    if (!requestId) {
      toast.error('Missing requestId in notification meta');
      return;
    }

    const link = replyLink.trim();
    if (!link) {
      toast.error('Please paste the movie link');
      return;
    }

    try {
      setReplyLoading(true);

      await Axios.post(
        `/requests/${requestId}/reply`,
        {
          link,
          message: replyMessage.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      toast.success('Reply sent to user');

      if (!notif.read) dispatch(markNotificationAsRead(notif._id));
      dispatch(getNotificationsAction(true));

      setReplyOpenId(null);
      setReplyLink('');
      setReplyMessage('');
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || e?.message || 'Reply failed');
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="bg-main shadow-md sticky top-0 z-20">
      <div className="container mx-auto py-6 above-1000:py-4 px-8 mobile:px-0 mobile:py-3 lg:grid gap-10 above-1000:gap-8 grid-cols-7 justify-between items-center">
        {/* Logo */}
        <div className="hidden lg:block col-span-1">
          <Link to="/">
            <img
              src="/images/MOVIEFROST.png"
              alt="logo"
              className="w-full h-11 above-1000:h-9 object-contain"
            />
          </Link>
        </div>

        {/* Search */}
        <div
          className="col-span-2 mobile:col-span-7 relative mobile:w-full"
          ref={dropdownRef}
        >
          <form
            onSubmit={handleSearch}
            className="w-full mobile:w-full text-sm above-1000:text-xs bg-black rounded mobile:rounded-none flex-btn gap-4 mobile:gap-2 border-2 border-customPurple "
          >
            <button
              type="submit"
              className="bg-customPurple w-12 above-1000:w-10 mobile:w-10 flex-colo h-11 above-1000:h-10 mobile:h-10 rounded-sm mobile:rounded-none text-white"
              aria-label="Search movies"
            >
              <FaSearch
                className="above-1000:text-sm mobile:text-base"
                aria-hidden="true"
              />
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
                aria-label="Clear search"
              >
                <IoClose size={20} className="mobile:w-5 mobile:h-5" />
              </button>
            )}
          </form>

          {/* Suggestions */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-dry border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
              {searchResults.map((movie) => (
                <Link
                  key={movie._id}
                  to={`/movie/${movie?.slug || movie?._id}`}
                  onClick={() => {
                    setShowDropdown(false);
                    setSearch('');
                  }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-main transitions border-b border-border/50 last:border-b-0"
                >
                  <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-main">
                    <img
                      src={movie?.titleImage || '/images/placeholder.jpg'}
                      alt={movie?.name || 'Movie poster'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {movie.name}
                    </p>
                    <p className="text-xs text-dryGray truncate">
                      {movie.year} • {movie.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Desktop links */}
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
            </div>
          </div>

          {/* Indian Dropdown */}
          <div className="relative group">
            <button className={`${hover} inline-flex items-center`} type="button">
              Indian
            </button>
            <div className="absolute left-0 top-full bg-black text-white above-1000:text-xs min-w-[180px] p-2 rounded shadow-md opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
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
            </div>
          </div>

          {/* Browse By dropdown */}
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
            </div>
          </div>

          <NavLink to="/contact-us" className={Hover}>
            Contact Us
          </NavLink>

          {/* ✅ Notifications */}
          <div className="relative" ref={notifyRef}>
            <button
              className="relative"
              onClick={toggleNotifyDropdown}
              aria-label={`Notifications ${
                unreadCount > 0 ? `(${unreadCount} unread)` : ''
              }`}
              aria-expanded={notifyOpen}
              aria-controls="notifications-dropdown"
            >
              <FaBell
                className="w-6 h-6 above-1000:w-5 above-1000:h-5 text-white"
                aria-hidden="true"
              />
              {unreadCount > 0 && (
                <span
                  className="w-5 h-5 above-1000:w-4 above-1000:h-4 flex-colo rounded-full text-xs above-1000:text-[10px] bg-customPurple text-white absolute -top-3 -right-3"
                  aria-label={`${unreadCount} unread notifications`}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {notifyOpen && (
              <div
                id="notifications-dropdown"
                className="absolute right-0 mt-2 w-96 bg-black border border-customPurple rounded shadow-xl z-50 p-2 max-h-96 overflow-y-auto"
              >
                {/* ✅ UPDATED header */}
                <div className="flex items-center justify-between px-2 mb-2 gap-2">
                  <h4 className="text-sm font-semibold text-white">
                    Notifications
                  </h4>

                  <div className="flex items-center gap-3">
                    {/* ✅ NEW: request button (hide for admin) */}
                    {!userInfo?.isAdmin && (
                      <button
                        onClick={openWatchRequestPopup}
                        className="text-xs text-customPurple hover:underline"
                        type="button"
                      >
                        Request Movie
                      </button>
                    )}

                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearNotifications}
                        className="text-xs text-subMain hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {notifLoading && (
                  <p className="text-xs text-border px-2 py-2">Loading...</p>
                )}

                {!notifLoading && notifications.length === 0 && (
                  <div className="px-2 py-2">
                    <p className="text-sm text-border mb-2">No notifications</p>

                    {/* ✅ NEW: CTA when empty */}
                    {!userInfo?.isAdmin && (
                      <button
                        onClick={openWatchRequestPopup}
                        className="w-full border border-customPurple text-customPurple hover:bg-customPurple hover:text-white transitions rounded py-2 text-sm"
                        type="button"
                      >
                        Request a Movie / Web‑Series
                      </button>
                    )}
                  </div>
                )}

                {!notifLoading &&
                  [...notifications]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt || 0).getTime() -
                        new Date(a.createdAt || 0).getTime()
                    )
                    .map((notif) => (
                      <div
                        key={notif._id}
                        className={`text-sm text-white px-2 py-2 border-b border-gray-700 last:border-b-0 group ${
                          !notif.read ? 'bg-gray-800/50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div
                            onClick={() => handleNotificationClick(notif)}
                            className={`cursor-pointer flex-grow ${
                              notif.read ? 'opacity-70' : ''
                            }`}
                          >
                            {notif.title ? (
                              <p className="text-xs font-semibold text-white mb-1">
                                {notif.title}
                              </p>
                            ) : null}
                            <p className="text-sm">{notif.message}</p>
                          </div>

                          <button
                            onClick={() => handleRemoveSingleNotification(notif._id)}
                            className="text-xs text-gray-500 hover:text-red-500 ml-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove notification"
                            aria-label="Remove notification"
                          >
                            <IoClose size={14} />
                          </button>
                        </div>

                        {/* Admin reply UI */}
                        {userInfo?.isAdmin && notif.type === 'watch_request' && (
                          <div className="mt-2">
                            <button
                              onClick={() => {
                                setReplyOpenId((prev) =>
                                  prev === notif._id ? null : notif._id
                                );
                                setReplyLink('');
                                setReplyMessage('');
                              }}
                              className="text-xs text-customPurple hover:underline"
                            >
                              {replyOpenId === notif._id ? 'Close Reply' : 'Reply'}
                            </button>

                            {replyOpenId === notif._id && (
                              <div className="mt-2 space-y-2">
                                <input
                                  value={replyLink}
                                  onChange={(e) => setReplyLink(e.target.value)}
                                  placeholder="Paste movie link (https://...)"
                                  className="w-full bg-main border border-border rounded px-2 py-2 text-xs outline-none focus:border-customPurple"
                                />
                                <input
                                  value={replyMessage}
                                  onChange={(e) => setReplyMessage(e.target.value)}
                                  placeholder="Optional message to user"
                                  className="w-full bg-main border border-border rounded px-2 py-2 text-xs outline-none focus:border-customPurple"
                                />
                                <button
                                  onClick={() => handleAdminReplyRequest(notif)}
                                  className="w-full bg-customPurple text-white rounded py-2 text-xs disabled:opacity-60"
                                  disabled={replyLoading}
                                >
                                  {replyLoading ? 'Sending...' : 'Send'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <NavLink
            to={
              userInfo?.isAdmin
                ? '/dashboard'
                : userInfo
                ? '/profile'
                : '/login'
            }
            className={Hover}
            aria-label={userInfo ? `${userInfo.fullName} profile` : 'Login'}
          >
            {userInfo ? (
              <img
                src={
                  userInfo?.image
                    ? userInfo?.image
                    : '/images/profile-user (1).png'
                }
                alt={userInfo?.fullName || 'Profile'}
                className="w-8 h-8 above-1000:w-6 above-1000:h-6 rounded-full border object-cover border-customPurple"
              />
            ) : (
              <CgUser className="w-8 h-8 above-1000:w-6 above-1000:h-6" />
            )}
          </NavLink>

          {/* Favorites */}
          <NavLink to="/favorites" className={`${Hover} relative`} aria-label="Favorites">
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