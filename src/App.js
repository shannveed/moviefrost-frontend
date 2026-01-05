// Frontend/src/App.js
import React, { useEffect, useRef, Suspense, lazy, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ScrollOnTop from './ScrollOnTop';
import DrawerContext from './Context/DrawerContext';
import ToastContainer from './Components/Notifications/ToastContainer';
import { AdminProtectedRouter, ProtectedRouter } from './ProtectedRoutes';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCategoriesAction } from './Redux/Actions/CategoriesActions';
import { getAllMoviesAction } from './Redux/Actions/MoviesActions';
import { getFavoriteMoviesAction } from './Redux/Actions/userActions';
import toast from 'react-hot-toast';
import {
  trackUserType,
  trackGuestExit,
  trackLoginPrompt,
} from './utils/analytics';
import Loader from './Components/Loader';

import Axios from './Redux/APIs/Axios';
import MovieRequestPopup from './Components/Modals/MovieRequestPopup';
import ChannelPopup from './Components/Modals/ChannelPopup';
import InstallPwaPopup from './Components/Modals/InstallPwaPopup';
import { FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';

import { getNotificationsAction } from './Redux/Actions/notificationsActions';
import { ensurePushSubscription } from './utils/pushNotifications';

// ✅ NEW
import { OPEN_WATCH_REQUEST_POPUP } from './utils/events';

// Non-lazy route components you already had
import HollywoodSection from './Components/Home/HollywoodSection';
import KoreanSection from './Components/Home/KoreanSection';
import BollywoodSection from './Components/Home/BollywoodSection';
import HollywoodHindiSection from './Components/Home/HollywoodHindiSection';
import KoreanHindiSection from './Components/Home/KoreanHindiSection';
import JapaneseSection from './Components/Home/JapaneseSection';
import SouthIndianSection from './Components/Home/SouthIndianSection';
import PunjabiSection from './Components/Home/PunjabiSection';
import ChineseDramaSection from './Components/Home/ChineseDramaSection';
import KoreanDramaSection from './Components/Home/KoreanDramaSection';
import JapaneseAnimeSection from './Components/Home/JapaneseAnimeSection';


// Lazy load pages
const HomeScreen = lazy(() => import('./Screens/HomeScreen'));
const MoviesPage = lazy(() => import('./Screens/Movies'));
const SingleMovie = lazy(() => import('./Screens/SingleMovie'));
const WatchPage = lazy(() => import('./Screens/WatchPage'));
const Dashboard = lazy(() => import('./Screens/Dashboard/Admin/Dashboard'));
const MoviesList = lazy(() => import('./Screens/Dashboard/Admin/MoviesList'));
const AddMovie = lazy(() => import('./Screens/Dashboard/Admin/AddMovie'));
const EditMovie = lazy(() => import('./Screens/Dashboard/Admin/EditMovie'));
const AboutUs = lazy(() => import('./Screens/AboutUs'));
const ContactUs = lazy(() => import('./Screens/ContactUs'));
const Login = lazy(() => import('./Screens/Login'));
const Register = lazy(() => import('./Screens/Register'));
const Profile = lazy(() => import('./Screens/Dashboard/Profile'));
const Password = lazy(() => import('./Screens/Dashboard/Password'));
const FavoritesMovies = lazy(() => import('./Screens/Dashboard/FavouriteMovies'));
const Categories = lazy(() => import('./Screens/Dashboard/Admin/Categories'));
const Users = lazy(() => import('./Screens/Dashboard/Admin/Users'));
const NotFound = lazy(() => import('./Screens/NotFound'));
const GoogleAnalytics = lazy(() => import('./Components/GoogleAnalytics'));

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-colo gap-6 w-full min-h-screen text-white bg-main">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-text">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            className="bg-customPurple text-white px-6 py-2 rounded hover:bg-opacity-80"
          >
            Go to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingFallback = () => (
  <div className="flex-colo w-full min-h-screen">
    <Loader />
  </div>
);

/* ============================
   PWA helpers
   ============================ */
const isStandaloneMode = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.matchMedia?.('(display-mode: fullscreen)')?.matches ||
    window.navigator?.standalone === true
  );
};

const isIOSDevice = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isIpadOS = /Macintosh/i.test(ua) && window.navigator.maxTouchPoints > 1;
  return isIOS || isIpadOS;
};

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const pageEntryTime = useRef(Date.now());
  const hasShownPrompt = useRef(false);
  const aosInitialized = useRef(false);

  const { userInfo } = useSelector((state) => state.userLogin || {});
  const { isError, isSuccess } = useSelector((state) => state.userLikeMovie || {});
  const { isError: catError } = useSelector((state) => state.categoryGetAll || {});

  const TELEGRAM_CHANNEL_URL = process.env.REACT_APP_TELEGRAM_CHANNEL_URL || '';
  const WHATSAPP_CHANNEL_URL = process.env.REACT_APP_WHATSAPP_CHANNEL_URL || '';

  const [telegramPopupOpen, setTelegramPopupOpen] = useState(false);
  const [whatsappPopupOpen, setWhatsappPopupOpen] = useState(false);

  // ✅ Movie Request popup (manual + auto)
  const [requestPopupOpen, setRequestPopupOpen] = useState(false);

  const [installPopupOpen, setInstallPopupOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  /* ============================================================
     ✅ NEW: Allow Navbar/MobileFooter to open MovieRequestPopup
     ============================================================ */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const openHandler = () => {
      setRequestPopupOpen(true);
      try {
        // prevent the 1-minute auto popup from showing later in this session
        sessionStorage.setItem('movieRequestPopupShown', '1');
      } catch {}
    };

    window.addEventListener(OPEN_WATCH_REQUEST_POPUP, openHandler);
    return () => window.removeEventListener(OPEN_WATCH_REQUEST_POPUP, openHandler);
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onAppInstalled = () => {
      setInstallPopupOpen(false);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('pwaInstalled', '1');
      } catch {
        // ignore
      }
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  useEffect(() => {
    const path = location.pathname;

    if (path === '/login' || path === '/register') return;
    if (path.startsWith('/watch')) return;

    if (isStandaloneMode()) return;

    try {
      if (localStorage.getItem('pwaInstalled') === '1') return;
    } catch {}

    try {
      if (sessionStorage.getItem('pwaInstallPopupShown')) return;
    } catch {}

    const t = setTimeout(() => {
      if (isStandaloneMode()) return;
      setInstallPopupOpen(true);
      try {
        sessionStorage.setItem('pwaInstallPopupShown', '1');
      } catch {}
    }, 10000);

    return () => clearTimeout(t);
  }, [location.pathname]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      setDeferredPrompt(null);
      setInstallPopupOpen(false);

      if (choice?.outcome === 'accepted') {
        toast.success('App installed!');
        try {
          localStorage.setItem('pwaInstalled', '1');
        } catch {}
      }
    } catch (e) {
      console.error('Install prompt failed:', e);
      toast.error('Install failed. Please try again from the browser menu.');
    }
  };

  useEffect(() => {
    const path = location.pathname;
    const isAuth = path === '/login' || path === '/register';
    if (isAuth) {
      const key = 'reloaded:' + path;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.replace(path + location.search + location.hash);
      }
    } else {
      sessionStorage.removeItem('reloaded:/login');
      sessionStorage.removeItem('reloaded:/register');
    }
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!aosInitialized.current) {
      import('aos').then((AOS) => {
        AOS.init({
          duration: 800,
          once: true,
          disable: 'mobile',
        });
        aosInitialized.current = true;
      });
    }
  }, []);

  useEffect(() => {
    trackUserType(!!userInfo);
  }, [userInfo]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!userInfo) {
        const timeSpent = Math.floor((Date.now() - pageEntryTime.current) / 1000);
        trackGuestExit(location.pathname, timeSpent);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userInfo, location.pathname]);

  useEffect(() => {
    pageEntryTime.current = Date.now();
  }, [location.pathname]);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  useEffect(() => {
    const load = () => {
      try {
        dispatch(getAllCategoriesAction());
        dispatch(getAllMoviesAction({}));
        if (userInfo) dispatch(getFavoriteMoviesAction());
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Error loading data. Please refresh the page.');
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(load);
    } else {
      setTimeout(load, 100);
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (isError || catError) {
      toast.error(isError || catError);
      dispatch({ type: 'LIKE_MOVIE_RESET' });
    }
    if (isSuccess) {
      dispatch({ type: 'LIKE_MOVIE_RESET' });
    }
  }, [dispatch, isError, catError, isSuccess]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userInfo && !hasShownPrompt.current) {
        hasShownPrompt.current = true;

        const redirectState = {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
          scrollY: window.scrollY,
        };
        localStorage.setItem('redirectAfterLogin', JSON.stringify(redirectState));

        trackLoginPrompt('30_minute_timer', location.pathname);
        alert('Please log in now for free to continue');
        navigate('/login');
      }
    }, 30 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [userInfo, navigate, location]);

  /* ============================================================
     Telegram popup (after 30 seconds)
     ============================================================ */
  useEffect(() => {
    const path = location.pathname;

    if (!TELEGRAM_CHANNEL_URL) return;
    if (path === '/login' || path === '/register') return;
    if (path.startsWith('/watch')) return;

    if (sessionStorage.getItem('telegramPopupShown')) return;

    const t = setTimeout(() => {
      setTelegramPopupOpen(true);
      sessionStorage.setItem('telegramPopupShown', '1');
    }, 30000);

    return () => clearTimeout(t);
  }, [location.pathname, TELEGRAM_CHANNEL_URL]);

  /* ============================================================
     Movie Request popup (after 1minute) — existing
     ============================================================ */
  useEffect(() => {
    const path = location.pathname;

    if (path === '/login' || path === '/register') return;
    if (path.startsWith('/watch')) return;

    if (sessionStorage.getItem('movieRequestPopupShown')) return;

    const t = setTimeout(() => {
      setRequestPopupOpen(true);
      sessionStorage.setItem('movieRequestPopupShown', '1');
    }, 60000);

    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    const run = async () => {
      if (!userInfo?.token) return;

      dispatch(getNotificationsAction(true));

      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          await ensurePushSubscription(userInfo.token);
        }
      } catch {}

      const raw = localStorage.getItem('pendingWatchRequest');
      if (!raw) return;

      try {
        const pending = JSON.parse(raw);
        const title = pending?.title;
        if (!title) return;

        await Axios.post(
          '/requests',
          { title },
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
      } catch (e) {
        console.warn('Auto-submit pendingWatchRequest failed:', e);
      } finally {
        localStorage.removeItem('pendingWatchRequest');
      }
    };

    run();
  }, [userInfo?.token, dispatch]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event) => {
      if (event?.data?.type === 'PUSH_RECEIVED' && userInfo?.token) {
        dispatch(getNotificationsAction(true));
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [dispatch, userInfo?.token]);

  return (
    <ErrorBoundary>
      <DrawerContext>
        <ToastContainer />
        
        <InstallPwaPopup
          open={installPopupOpen}
          onClose={() => setInstallPopupOpen(false)}
          onInstall={handleInstallClick}
          canInstall={!!deferredPrompt}
          isIOS={isIOSDevice()}
        />

        {/* ✅ Telegram popup */}
        {TELEGRAM_CHANNEL_URL ? (
          <ChannelPopup
            open={telegramPopupOpen}
            onClose={() => setTelegramPopupOpen(false)}
            title="Join our Telegram Channel"
            description="Get instant updates, new uploads, and announcements."
            buttonText="Open Telegram"
            url={TELEGRAM_CHANNEL_URL}
            Icon={FaTelegramPlane}
            showMaybeLater={false}
          />
        ) : null}

        {/* ✅ WhatsApp popup */}
        {WHATSAPP_CHANNEL_URL ? (
          <ChannelPopup
            open={whatsappPopupOpen}
            onClose={() => setWhatsappPopupOpen(false)}
            title="Join our WhatsApp Channel"
            description="Receive updates , new uploads, and announcements directly on WhatsApp."
            buttonText="Open WhatsApp"
            url={WHATSAPP_CHANNEL_URL}
            Icon={FaWhatsapp}
          />
        ) : null}

        {/* ✅ Movie request popup (manual + auto) */}
        <MovieRequestPopup
          open={requestPopupOpen}
          onClose={() => setRequestPopupOpen(false)}
        />

        <ScrollOnTop>
          <Suspense fallback={<LoadingFallback />}>
            <GoogleAnalytics />
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<HomeScreen />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movies/:search" element={<MoviesPage />} />
              <Route path="/movie/:id" element={<SingleMovie />} />
              <Route path="/watch/:id" element={<WatchPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* extra browse routes */}
              <Route path="/Hollywood" element={<HollywoodSection />} />
              <Route path="/Korean" element={<KoreanSection />} />
              <Route path="/Bollywood" element={<BollywoodSection />} />
              <Route path="/Hollywood-Hindi" element={<HollywoodHindiSection />} />
              <Route path="/Korean-Hindi" element={<KoreanHindiSection />} />
              <Route path="/Japanease" element={<JapaneseSection />} />
              <Route path="/South-Indian" element={<SouthIndianSection />} />
              <Route path="/Punjabi" element={<PunjabiSection />} />
              <Route path="/Chinese" element={<ChineseDramaSection />} />
              <Route path="/korean-drama" element={<KoreanDramaSection />} />
              <Route path="/japanese-anime" element={<JapaneseAnimeSection />} />

              <Route path="*" element={<NotFound />} />

              {/* PRIVATE ROUTES */}
              <Route element={<ProtectedRouter />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/password" element={<Password />} />
                <Route path="/favorites" element={<FavoritesMovies />} />
                <Route path="/edit/:id" element={<EditMovie />} />
              </Route>

              {/* ADMIN ROUTES */}
              <Route element={<AdminProtectedRouter />}>
                <Route path="/movieslist" element={<MoviesList />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/users" element={<Users />} />
                <Route path="/addmovie" element={<AddMovie />} />
              </Route>
            </Routes>
          </Suspense>
        </ScrollOnTop>
      </DrawerContext>
    </ErrorBoundary>
  );
}

export default App;