// App.js
import React, { useEffect, useRef, Suspense, lazy } from 'react';
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
import { trackUserType, trackGuestExit, trackLoginPrompt } from './utils/analytics';
import Loader from './Components/Loader';

// Lazy load ALL components
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

// Error Boundary Component
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
          <p className="text-text">{this.state.error?.message || 'An unexpected error occurred'}</p>
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

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex-colo w-full min-h-screen">
    <Loader />
  </div>
);

function App() {
  // React-snap compatibility
  useEffect(() => {
    if (navigator.userAgent.includes('ReactSnap')) {
      // Disable certain features during pre-rendering
      console.log('Pre-rendering detected');
    }
  }, []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const pageEntryTime = useRef(Date.now());
  const hasShownPrompt = useRef(false);
  const aosInitialized = useRef(false);

  // Initialize AOS only once after component mount
  useEffect(() => {
    if (!aosInitialized.current) {
      import('aos').then((AOS) => {
        AOS.init({
          duration: 800,
          once: true,
          disable: 'mobile' // Disable on mobile for better performance
        });
        aosInitialized.current = true;
      });
    }
  }, []);

  // useEffect(() => {
  //   // Handle www to non-www redirect in production
  //   if (process.env.NODE_ENV === 'production') {
  //     const currentHost = window.location.hostname;
  //     if (currentHost === 'www.moviefrost.com') {
  //       const newUrl = window.location.href.replace('://www.', '://');
  //       if (newUrl !== window.location.href) {
  //         window.location.replace(newUrl);
  //       }
  //     }
  //   }
  // }, []);

  const { userInfo } = useSelector((state) => state.userLogin || {});
  const { isError, isSuccess } = useSelector((state) => state.userLikeMovie || {});
  const { isError: catError } = useSelector((state) => state.categoryGetAll || {});

  // Track user type on mount and when userInfo changes
  useEffect(() => {
    trackUserType(!!userInfo);
  }, [userInfo]);

  // Track guest user exit
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

  // Reset page entry time on route change
  useEffect(() => {
    pageEntryTime.current = Date.now();
  }, [location.pathname]);

  // Disable right click
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Load initial data with request idle callback
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        try {
          dispatch(getAllCategoriesAction());
          dispatch(getAllMoviesAction({}));
          if (userInfo) {
            dispatch(getFavoriteMoviesAction());
          }
        } catch (error) {
          console.error('Error loading initial data:', error);
          toast.error('Error loading data. Please refresh the page.');
        }
      });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        try {
          dispatch(getAllCategoriesAction());
          dispatch(getAllMoviesAction({}));
          if (userInfo) {
            dispatch(getFavoriteMoviesAction());
          }
        } catch (error) {
          console.error('Error loading initial data:', error);
          toast.error('Error loading data. Please refresh the page.');
        }
      }, 100);
    }
  }, [dispatch, userInfo]);

  // Handle errors
  useEffect(() => {
    if (isError || catError) {
      toast.error(isError || catError);
      dispatch({ type: 'LIKE_MOVIE_RESET' });
    }
    if (isSuccess) {
      dispatch({ type: 'LIKE_MOVIE_RESET' });
    }
  }, [dispatch, isError, catError, isSuccess]);

  // Alert every 30 minutes if not logged in
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userInfo && !hasShownPrompt.current) {
        hasShownPrompt.current = true;
        
        const redirectState = {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
          scrollY: window.scrollY
        };
        
        localStorage.setItem('redirectAfterLogin', JSON.stringify(redirectState));
        trackLoginPrompt('30_minute_timer', location.pathname);
        alert('Please log in now for free to continue');
        navigate('/login');
      }
    }, 30 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [userInfo, navigate, location]);

  // DevTools detection code - load only in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const loadDevToolsDetection = async () => {
        const module = await import('./utils/devToolsDetection');
        module.initDevToolsDetection();
      };
      loadDevToolsDetection();
    }
  }, []);

  return (
    <ErrorBoundary>
      <DrawerContext>
        <ToastContainer />
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
