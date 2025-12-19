// MobileFooter.js
import React, { useContext, useEffect, useState } from 'react';
import { BsCollectionPlay } from 'react-icons/bs';
import { CgMenuBoxed } from 'react-icons/cg';
import { BiHomeAlt, BiCategory } from 'react-icons/bi';
import { FaBell } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import MenuDrawer from '../../Components/Drawer/MenuDrawer';
import { SidebarContext } from '../../Context/DrawerContext';
import Axios from '../../Redux/APIs/Axios';

import {
  clearNotifications,
  removeNotification,
  markNotificationAsRead,
  getNotificationsAction,
} from '../../Redux/Actions/notificationsActions';

function MobileFooter() {
  const {
    mobileDrawer,
    toggleDrawer,
    activeMobileTab,
    setActiveMobileTab,
  } = useContext(SidebarContext);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo } = useSelector((state) => state.userLogin || {});
  const {
    notifications = [],
    unreadCount = 0,
    isLoading: notifLoading,
    isError: notifError,
  } = useSelector((state) => state.notifications || {});

  // Mobile notifications panel open/close
  const [notifyOpen, setNotifyOpen] = useState(false);

  // Admin reply UI (same as Navbar)
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyLink, setReplyLink] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  // Close notifications panel helper
  const closeNotifications = () => {
    setNotifyOpen(false);
    setReplyOpenId(null);
    setReplyLink('');
    setReplyMessage('');
  };

  // Optional: show notif errors as toast
  useEffect(() => {
    if (notifError) toast.error(notifError);
  }, [notifError]);

  // Close notifications when user logs out
  useEffect(() => {
    if (!userInfo?.token) closeNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.token]);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (notifyOpen && userInfo?.token) {
      dispatch(getNotificationsAction(true));
    }
  }, [notifyOpen, userInfo?.token, dispatch]);

  // Handle Home tab click
  const handleHomeClick = (e) => {
    e.preventDefault();
    closeNotifications();
    if (mobileDrawer) toggleDrawer();

    if (isHomePage) {
      setActiveMobileTab('home');
      window.scrollTo(0, 0);
    } else {
      setActiveMobileTab('home');
      navigate('/');
    }
  };

  // Handle BrowseBy tab click
  const handleBrowseByClick = (e) => {
    e.preventDefault();
    closeNotifications();
    if (mobileDrawer) toggleDrawer();

    if (isHomePage) {
      setActiveMobileTab('browseBy');
      window.scrollTo(0, 0);
    } else {
      setActiveMobileTab('browseBy');
      navigate('/');
    }
  };

  const handleMenuClick = () => {
    closeNotifications();
    toggleDrawer();
  };

  const handleNotificationsClick = (e) => {
    e.preventDefault();

    // If drawer open, close it first
    if (mobileDrawer) toggleDrawer();

    if (!userInfo?.token) {
      toast.error('Please login to view notifications');
      navigate('/login');
      return;
    }

    setNotifyOpen((prev) => {
      const next = !prev;
      if (next) dispatch(getNotificationsAction(true));
      return next;
    });
  };

  const handleClearNotifications = () => {
    dispatch(clearNotifications());
    closeNotifications();
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

    closeNotifications();
  };

  // Admin: reply to watch request (notif.type === 'watch_request')
  const handleAdminReplyRequest = async (notif) => {
    const requestId = notif?.meta?.requestId;
    if (!requestId) {
      toast.error('Missing requestId in notification meta');
      return;
    }

    const link = replyLink.trim();
    if (!link) {
      toast.error('Please paste the movie/web-series link');
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
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      toast.success('Reply sent to user');

      if (!notif.read) dispatch(markNotificationAsRead(notif._id));
      dispatch(getNotificationsAction(true));

      setReplyOpenId(null);
      setReplyLink('');
      setReplyMessage('');
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Reply failed'
      );
    } finally {
      setReplyLoading(false);
    }
  };

  // NavLink styling
  const active = 'bg-customPurple text-white';
  const inActive =
    'transition duration-300 text-xl flex-colo text-white hover:bg-customPurple hover:text-white rounded-md px-3 py-1.5';

  const isHomeActive = isHomePage && activeMobileTab === 'home';
  const isBrowseByActive = isHomePage && activeMobileTab === 'browseBy';
  const isNotifActive = notifyOpen;

  const sortedNotifications = [...notifications].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  return (
    <>
      {/* Mobile menu drawer */}
      <MenuDrawer drawerOpen={mobileDrawer} toggleDrawer={toggleDrawer} />

      {/* ✅ Mobile Notifications Panel */}
      {notifyOpen && (
        <div
          className="fixed inset-0 z-[60]"
          aria-modal="true"
          role="dialog"
          onClick={closeNotifications}
        >
          <div className="absolute inset-0 bg-black/60" />

          <div
            className="absolute left-2 right-2 bottom-20 bg-black border border-customPurple rounded-lg shadow-xl z-[61] p-2 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 py-1">
              <h4 className="text-sm font-semibold text-white">
                Notifications
              </h4>

              <div className="flex items-center gap-2">
                {sortedNotifications.length > 0 && (
                  <button
                    onClick={handleClearNotifications}
                    className="text-xs text-subMain hover:underline"
                  >
                    Clear all
                  </button>
                )}

                <button
                  onClick={closeNotifications}
                  className="text-gray-400 hover:text-white"
                  aria-label="Close notifications"
                >
                  <IoClose size={18} />
                </button>
              </div>
            </div>

            {notifLoading && (
              <p className="text-xs text-border px-2 py-2">Loading...</p>
            )}

            {!notifLoading && sortedNotifications.length === 0 && (
              <p className="text-sm text-border px-2 py-2">
                No notifications
              </p>
            )}

            {!notifLoading &&
              sortedNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`text-white px-2 py-2 border border-gray-700 rounded-md mb-2 last:mb-0 ${
                    !notif.read ? 'bg-gray-800/50' : 'bg-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notif)}
                      className={`text-left flex-1 ${
                        notif.read ? 'opacity-70' : ''
                      }`}
                    >
                      {notif.title ? (
                        <p className="text-xs font-semibold mb-1">
                          {notif.title}
                        </p>
                      ) : null}
                      <p className="text-sm">{notif.message}</p>
                    </button>

                    <button
                      onClick={() => handleRemoveSingleNotification(notif._id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Remove notification"
                      aria-label="Remove notification"
                    >
                      <IoClose size={14} />
                    </button>
                  </div>

                  {/* ✅ Admin reply UI (same as Navbar) */}
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
        </div>
      )}

      {/* Bottom navigation bar */}
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
            onClick={() => {
              closeNotifications();
              setActiveMobileTab('movies');
            }}
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

          {/* ✅ NEW: Notifications Tab (between Movies and Menu) */}
          <button
            onClick={handleNotificationsClick}
            className={isNotifActive ? `${active} ${inActive}` : inActive}
            aria-label={`Notifications ${
              unreadCount > 0 ? `(${unreadCount} unread)` : ''
            }`}
          >
            <div className="relative flex flex-col items-center">
              <FaBell className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 w-5 h-5 flex-colo rounded-full text-[10px] bg-customPurple text-white">
                  {unreadCount}
                </span>
              )}
              <span className="text-[9px] mt-0.5">Alerts</span>
            </div>
          </button>

          {/* Menu Tab */}
          <button onClick={handleMenuClick} className={inActive} aria-label="Menu">
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
