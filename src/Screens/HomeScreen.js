// Frontend/src/Screens/HomeScreen.js
import React, { useEffect, useMemo, useRef, useContext, useState } from 'react';
import Layout from '../Layout/Layout';
import PopularMovies from '../Components/Home/PopularMovies';
import Promos from '../Components/Home/Promos';
import TopRated from '../Components/Home/TopRated';
import Banner from '../Components/Home/Banner';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllMoviesAction,
  getRandomMoviesAction,
  getTopRatedMovieAction,
  getLatestMoviesAction,
} from '../Redux/Actions/MoviesActions';
import toast from 'react-hot-toast';
import MetaTags from '../Components/SEO/MetaTags';
import { Link, useNavigationType } from 'react-router-dom';

import HollywoodSection from '../Components/Home/HollywoodSection';
import HollywoodHindiSection from '../Components/Home/HollywoodHindiSection';
import BollywoodSection from '../Components/Home/BollywoodSection';
import KoreanDramaSection from '../Components/Home/KoreanDramaSection';
import KoreanSection from '../Components/Home/KoreanSection';
import KoreanHindiSection from '../Components/Home/KoreanHindiSection';
import ChineseDramaSection from '../Components/Home/ChineseDramaSection';
import JapaneseSection from '../Components/Home/JapaneseSection';
import JapaneseAnimeSection from '../Components/Home/JapaneseAnimeSection';
import SouthIndianSection from '../Components/Home/SouthIndianSection';
import PunjabiSection from '../Components/Home/PunjabiSection';

import LazyLoadSection from '../Components/LazyLoadSection';
import Movie from '../Components/movie';
import Loader from '../Components/Loader';
import { RiMovie2Line } from 'react-icons/ri';
import { SidebarContext } from '../Context/DrawerContext';

import { IoClose } from 'react-icons/io5';

// ✅ Latest New APIs + ✅ Banner APIs + ✅ NEW reorder
import {
  getLatestNewMoviesService,
  getLatestNewMoviesAdminService,
  setLatestNewMoviesService,
  reorderLatestNewMoviesService, // ✅ NEW
  getBannerMoviesService,
  getBannerMoviesAdminService,
  setBannerMoviesService,
} from '../Redux/APIs/MoviesServices';

// ✅ Native Banner Ad
import EffectiveGateNativeBanner from '../Components/Ads/EffectiveGateNativeBanner';

function HomeScreen() {
  const dispatch = useDispatch();
  const navigationType = useNavigationType();

  // Mobile main tab + mobile home sub-tab from context
  const { activeMobileTab, activeMobileHomeTab, setActiveMobileHomeTab } =
    useContext(SidebarContext);

  // Logged-in user (needed for admin remove + reorder)
  const { userInfo } = useSelector((state) => state.userLogin || {});
  const isAdmin = !!userInfo?.isAdmin;

  // Desktop tab state (existing)
  const [activeDesktopTab, setActiveDesktopTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('homeDesktopTab');
      if (
        stored === 'latestNew' ||
        stored === 'latest' ||
        stored === 'browseBy'
      ) {
        return stored;
      }
    }
    return 'latestNew';
  });

  // Persist desktop tab selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('homeDesktopTab', activeDesktopTab);
    }
  }, [activeDesktopTab]);

  // Redux State
  const { isLoading, isError, movies = [] } = useSelector(
    (state) => state.getAllMovies || {}
  );

  const { isError: randomError } = useSelector(
    (state) => state.getRandomMovies || {}
  );
  const { isError: latestError } = useSelector(
    (state) => state.moviesLatest || {}
  );
  const {
    isError: topError,
    movies: topMovies = [],
    isLoading: topLoading,
  } = useSelector((state) => state.getTopRatedMovie || {});

  // ✅ Latest New data (Trending)
  const [latestNewMovies, setLatestNewMovies] = useState([]);
  const [latestNewLoading, setLatestNewLoading] = useState(false);
  const [latestNewError, setLatestNewError] = useState(null);
  const [removingLatestNewId, setRemovingLatestNewId] = useState(null);

  // ✅ NEW: Admin drag-to-reorder Trending (Latest New)
  const [latestNewAdminMode, setLatestNewAdminMode] = useState(false);
  const [latestNewLocalOrder, setLatestNewLocalOrder] = useState([]);
  const [latestNewDraggedId, setLatestNewDraggedId] = useState(null);
  const [latestNewHasPendingReorder, setLatestNewHasPendingReorder] =
    useState(false);
  const [savingLatestNewOrder, setSavingLatestNewOrder] = useState(false);

  // ✅ Banner data (HomeScreen Banner.js slider)
  const [bannerMovies, setBannerMovies] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerError, setBannerError] = useState(null);
  const [removingBannerId, setRemovingBannerId] = useState(null);

  // Ensure initial loads only once
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      dispatch(getAllMoviesAction({ pageNumber: 1 }));

      const loadSecondaryData = () => {
        try {
          dispatch(getLatestMoviesAction());
          dispatch(getRandomMoviesAction());
          dispatch(getTopRatedMovieAction());
        } catch (error) {
          console.error('Error loading secondary home data:', error);
        }
      };

      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(loadSecondaryData);
      } else {
        setTimeout(loadSecondaryData, 800);
      }
    } catch (error) {
      console.error('Error loading initial home data:', error);
      toast.error('Error loading data. Please refresh the page.');
    }
  }, [dispatch]);

  // ✅ Fetch Banner movies (always on home)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setBannerLoading(true);
        setBannerError(null);

        const data =
          isAdmin && userInfo?.token
            ? await getBannerMoviesAdminService(userInfo.token, 10)
            : await getBannerMoviesService(10);

        const list = Array.isArray(data) ? data : [];
        if (!cancelled) setBannerMovies(list.slice(0, 10));
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          'Failed to load Banner titles';
        if (!cancelled) setBannerError(msg);
      } finally {
        if (!cancelled) setBannerLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, userInfo?.token]);

  useEffect(() => {
    if (bannerError) toast.error(bannerError);
  }, [bannerError]);

  // ✅ Fetch Latest New when Trending tab is active (desktop or mobile)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.innerWidth < 640;

    const shouldFetch =
      (!isMobile && activeDesktopTab === 'latestNew') ||
      (isMobile &&
        activeMobileTab === 'home' &&
        activeMobileHomeTab === 'latestNew');

    if (!shouldFetch) return;

    let cancelled = false;

    (async () => {
      try {
        setLatestNewLoading(true);
        setLatestNewError(null);

        const data =
          isAdmin && userInfo?.token
            ? await getLatestNewMoviesAdminService(userInfo.token, 100)
            : await getLatestNewMoviesService(100);

        const list = Array.isArray(data) ? data : [];
        if (!cancelled) setLatestNewMovies(list.slice(0, 100));
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          'Failed to load Trending titles';
        if (!cancelled) setLatestNewError(msg);
      } finally {
        if (!cancelled) setLatestNewLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    activeDesktopTab,
    activeMobileTab,
    activeMobileHomeTab,
    isAdmin,
    userInfo?.token,
  ]);

  // ✅ Keep local reorder list in sync (same pattern as Movies.js admin reorder)
  useEffect(() => {
    if (isAdmin && latestNewAdminMode && Array.isArray(latestNewMovies)) {
      setLatestNewLocalOrder([...latestNewMovies]);
      setLatestNewHasPendingReorder(false);
      setLatestNewDraggedId(null);
    } else {
      setLatestNewLocalOrder([]);
      setLatestNewHasPendingReorder(false);
      setLatestNewDraggedId(null);
    }
  }, [isAdmin, latestNewAdminMode, latestNewMovies]);

  const trendingDisplayMovies =
    isAdmin && latestNewAdminMode && latestNewLocalOrder.length
      ? latestNewLocalOrder
      : latestNewMovies;

  // ✅ Drag handlers
  const handleLatestNewDragStart = (e, id) => {
    e.dataTransfer.effectAllowed = 'move';
    setLatestNewDraggedId(id);
  };

  const handleLatestNewDragEnter = (e, targetId) => {
    e.preventDefault();
    if (!latestNewDraggedId || latestNewDraggedId === targetId) return;

    setLatestNewLocalOrder((prev) => {
      if (!Array.isArray(prev) || !prev.length) return prev;

      const currentIndex = prev.findIndex((m) => m._id === latestNewDraggedId);
      const targetIndex = prev.findIndex((m) => m._id === targetId);
      if (currentIndex === -1 || targetIndex === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(currentIndex, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });

    setLatestNewHasPendingReorder(true);
  };

  const handleLatestNewDragEnd = () => setLatestNewDraggedId(null);

  const resetLatestNewOrder = () => {
    if (Array.isArray(latestNewMovies))
      setLatestNewLocalOrder([...latestNewMovies]);
    setLatestNewHasPendingReorder(false);
    setLatestNewDraggedId(null);
  };

  const handleSaveLatestNewOrder = async () => {
    if (!isAdmin || !userInfo?.token) return;
    if (!latestNewLocalOrder.length) return;

    try {
      setSavingLatestNewOrder(true);

      const orderedIds = latestNewLocalOrder.map((m) => m._id);
      await reorderLatestNewMoviesService(userInfo.token, orderedIds);

      toast.success('Trending order updated');
      setLatestNewHasPendingReorder(false);

      // reload from server to ensure UI matches DB
      const data = await getLatestNewMoviesAdminService(userInfo.token, 100);
      setLatestNewMovies(Array.isArray(data) ? data.slice(0, 100) : []);
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          'Failed to save Trending order'
      );
    } finally {
      setSavingLatestNewOrder(false);
    }
  };

  // ✅ Admin-only: remove from Trending
  const handleRemoveFromLatestNew = async (movieId) => {
    if (!isAdmin || !userInfo?.token) return;

    try {
      setRemovingLatestNewId(movieId);

      await setLatestNewMoviesService(userInfo.token, [movieId], false);

      setLatestNewMovies((prev) => prev.filter((m) => m._id !== movieId));
      setLatestNewLocalOrder((prev) => prev.filter((m) => m._id !== movieId));
      toast.success('Removed from Trending');
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          'Failed to remove from Trending'
      );
    } finally {
      setRemovingLatestNewId(null);
    }
  };

  // ✅ Admin-only: remove from Banner
  const handleRemoveFromBanner = async (movieId) => {
    if (!isAdmin || !userInfo?.token) return;

    try {
      setRemovingBannerId(movieId);

      await setBannerMoviesService(userInfo.token, [movieId], false);

      setBannerMovies((prev) => prev.filter((m) => m._id !== movieId));
      toast.success('Removed from Banner');
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          'Failed to remove from Banner'
      );
    } finally {
      setRemovingBannerId(null);
    }
  };

  // Restore scroll on browser back
  useEffect(() => {
    if (navigationType === 'POP') {
      const saved = sessionStorage.getItem('homeScrollY');
      if (saved) {
        setTimeout(() => {
          window.scrollTo(0, Number(saved) || 0);
        }, 50);
      }
    } else {
      sessionStorage.removeItem('homeScrollY');
    }
  }, [navigationType]);

  // Save scroll on unmount
  useEffect(() => {
    return () => {
      sessionStorage.setItem('homeScrollY', String(window.scrollY || 0));
    };
  }, []);

  // Errors
  useEffect(() => {
    if (isError || randomError || topError || latestError) {
      toast.error(isError || randomError || topError || latestError);
    }
  }, [isError, randomError, topError, latestError]);

  // Banner feed
  const bannerFeed = useMemo(() => {
    const curated = Array.isArray(bannerMovies) ? bannerMovies : [];
    if (curated.length > 0) return curated;
    return Array.isArray(movies) ? movies : [];
  }, [bannerMovies, movies]);

  // Latest Movies grid for home
  const latestGridMovies = useMemo(
    () => (Array.isArray(movies) ? movies.slice(0, 50) : []),
    [movies]
  );

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'MovieFrost - Free Movie Streaming',
    description:
      'Watch thousands of movies and web series online for free in HD quality',
    url: 'https://moviefrost.com',
  };

  /* ============================================================
     ✅ RENDER HELPERS (IMPORTANT FIX)
     These are functions (NOT inner React components), so React won’t
     unmount/mount them on every HomeScreen re-render.
     ============================================================ */

  const renderTrendingReorderBar = () => {
    if (!isAdmin) return null;

    const baseBtn =
      'px-4 py-2 text-sm rounded border transitions disabled:opacity-60';
    const activeBtn = 'bg-customPurple border-customPurple text-white';
    const inactiveBtn = 'border-customPurple text-white hover:bg-customPurple';

    return (
      <div className="my-4 p-4 bg-dry rounded-lg border border-border">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setLatestNewAdminMode((prev) => !prev)}
            className={`${baseBtn} ${
              latestNewAdminMode ? activeBtn : inactiveBtn
            }`}
          >
            {latestNewAdminMode ? 'Exit Edit Trending' : 'Edit Trending Order'}
          </button>

          {latestNewAdminMode && (
            <span className="text-xs text-dryGray">
              Drag cards to reorder Trending, then press Save.
            </span>
          )}

          {latestNewAdminMode && latestNewHasPendingReorder && (
            <>
              <button
                type="button"
                onClick={handleSaveLatestNewOrder}
                disabled={savingLatestNewOrder}
                className="px-4 py-2 text-sm rounded bg-green-600 hover:bg-green-700 text-white transitions disabled:opacity-60"
              >
                {savingLatestNewOrder ? 'Saving...' : 'Save Order'}
              </button>

              <button
                type="button"
                onClick={resetLatestNewOrder}
                disabled={savingLatestNewOrder}
                className="px-3 py-2 text-sm rounded border border-border text-white bg-main hover:bg-dry transitions disabled:opacity-60"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderMobileHomeTabs = () => {
    const tabBase =
      'flex-1 px-3 py-2 rounded-md text-sm font-semibold transitions border';
    const active = 'bg-customPurple text-white border-customPurple';
    const inactive = 'bg-dry text-white border-border hover:border-customPurple';

    return (
      <div className="sm:hidden mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMobileHomeTab('latestNew')}
            className={`${tabBase} ${
              activeMobileHomeTab === 'latestNew' ? active : inactive
            }`}
          >
            Trending
          </button>

          <button
            type="button"
            onClick={() => setActiveMobileHomeTab('latestMovies')}
            className={`${tabBase} ${
              activeMobileHomeTab === 'latestMovies' ? active : inactive
            }`}
          >
            New Releases
          </button>
        </div>
      </div>
    );
  };

  const renderMobileLatestNewTab = () => (
    <div className="sm:hidden">
      {latestNewLoading ? (
        <div className="w-full flex-colo py-12">
          <Loader />
        </div>
      ) : latestNewError ? (
        <p className="text-red-500 text-sm">{latestNewError}</p>
      ) : trendingDisplayMovies.length > 0 ? (
        <>
          {renderTrendingReorderBar()}

          <div className="grid grid-cols-2 gap-2">
            {trendingDisplayMovies.slice(0, 100).map((m) => (
              <div key={m._id} className="relative">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromLatestNew(m._id);
                    }}
                    disabled={removingLatestNewId === m._id}
                    className="absolute top-2 right-2 z-30 w-9 h-9 flex-colo rounded-full bg-red-600/85 hover:bg-red-600 text-white disabled:opacity-60"
                    title="Remove from Trending"
                    aria-label="Remove from Trending"
                  >
                    {removingLatestNewId === m._id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <IoClose className="text-xl" />
                    )}
                  </button>
                )}

                <Movie
                  movie={m}
                  adminDraggable={isAdmin && latestNewAdminMode}
                  onAdminDragStart={(e) => handleLatestNewDragStart(e, m._id)}
                  onAdminDragEnter={(e) => handleLatestNewDragEnter(e, m._id)}
                  onAdminDragEnd={handleLatestNewDragEnd}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8 mb-20">
            <Link
              to="/movies"
              className="bg-customPurple hover:bg-transparent border-2 border-customPurple text-white px-8 py-3 rounded-md font-semibold text-base transitions"
            >
              Show More
            </Link>
          </div>
        </>
      ) : (
        <div className="w-full gap-6 flex-colo py-12">
          <div className="flex-colo w-24 h-24 p-5 mb-4 rounded-full bg-dry text-customPurple text-4xl">
            <RiMovie2Line />
          </div>
          <p className="text-border text-sm">No Trending titles yet.</p>
        </div>
      )}
    </div>
  );

  const renderMobileLatestMoviesTab = () => (
    <div className="sm:hidden">
      {isLoading ? (
        <div className="w-full flex-colo py-12">
          <Loader />
        </div>
      ) : latestGridMovies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            {latestGridMovies.map((movie) => (
              <Movie key={movie._id} movie={movie} />
            ))}
          </div>

          <div className="flex justify-center mt-8 mb-20">
            <Link
              to="/movies"
              className="bg-customPurple hover:bg-transparent border-2 border-customPurple text-white px-8 py-3 rounded-md font-semibold text-base transitions"
            >
              Show More
            </Link>
          </div>
        </>
      ) : (
        <div className="w-full gap-6 flex-colo py-12">
          <div className="flex-colo w-24 h-24 p-5 mb-4 rounded-full bg-dry text-customPurple text-4xl">
            <RiMovie2Line />
          </div>
          <p className="text-border text-sm">
            It seems like we don't have any movies
          </p>
        </div>
      )}
    </div>
  );

  const renderMobileHomeContent = () => (
    <div className="my-4 mobile:px-4">
      {renderMobileHomeTabs()}
      {activeMobileHomeTab === 'latestNew'
        ? renderMobileLatestNewTab()
        : renderMobileLatestMoviesTab()}
    </div>
  );

  const renderMobileBrowseByContent = () => (
    <div className="mb-20">
      <PopularMovies movies={movies} isLoading={isLoading} />

      <LazyLoadSection>
        <HollywoodSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <HollywoodHindiSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <BollywoodSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <KoreanDramaSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <KoreanSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <KoreanHindiSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <ChineseDramaSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <JapaneseSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <JapaneseAnimeSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <SouthIndianSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <PunjabiSection />
      </LazyLoadSection>

      <LazyLoadSection height="400px">
        <Promos />
      </LazyLoadSection>
      <LazyLoadSection>
        <TopRated movies={topMovies} isLoading={topLoading} />
      </LazyLoadSection>
    </div>
  );

  const renderDesktopLatestNewContent = () => (
    <div className="my-8">
      {latestNewLoading ? (
        <div className="w-full flex-colo py-12">
          <Loader />
        </div>
      ) : latestNewError ? (
        <p className="text-red-500 text-sm">{latestNewError}</p>
      ) : trendingDisplayMovies.length > 0 ? (
        <>
          {renderTrendingReorderBar()}

          <div className="grid xl:grid-cols-5 2xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 gap-4">
            {trendingDisplayMovies.slice(0, 100).map((m) => (
              <div key={m._id} className="relative">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromLatestNew(m._id);
                    }}
                    disabled={removingLatestNewId === m._id}
                    className="absolute top-2 right-2 z-30 w-9 h-9 flex-colo rounded-full bg-red-600/80 hover:bg-red-600 text-white disabled:opacity-60"
                    title="Remove from Trending"
                    aria-label="Remove from Trending"
                  >
                    {removingLatestNewId === m._id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <IoClose className="text-xl" />
                    )}
                  </button>
                )}

                <Movie
                  movie={m}
                  adminDraggable={isAdmin && latestNewAdminMode}
                  onAdminDragStart={(e) => handleLatestNewDragStart(e, m._id)}
                  onAdminDragEnter={(e) => handleLatestNewDragEnter(e, m._id)}
                  onAdminDragEnd={handleLatestNewDragEnd}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Link
              to="/movies"
              className="bg-customPurple hover:bg-transparent border-2 border-customPurple text-white px-10 py-3 rounded-md font-semibold text-base transitions"
            >
              Show More
            </Link>
          </div>

          {/* ✅ Ad under Trending "Show More" */}
          <EffectiveGateNativeBanner />
        </>
      ) : (
        <div className="w-full gap-6 flex-colo py-12">
          <div className="flex-colo w-24 h-24 p-5 mb-4 rounded-full bg-dry text-customPurple text-4xl">
            <RiMovie2Line />
          </div>
          <p className="text-border text-sm">No Trending titles yet.</p>
        </div>
      )}
    </div>
  );

  const renderDesktopLatestContent = () => (
    <div className="my-8">
      {isLoading ? (
        <div className="w-full flex-colo py-12">
          <Loader />
        </div>
      ) : latestGridMovies.length > 0 ? (
        <>
          <div className="grid xl:grid-cols-5 2xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 gap-4">
            {latestGridMovies.map((movie) => (
              <Movie key={movie._id} movie={movie} />
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Link
              to="/movies"
              className="bg-customPurple hover:bg-transparent border-2 border-customPurple text-white px-10 py-3 rounded-md font-semibold text-base transitions"
            >
              Show More
            </Link>
          </div>

          {/* ✅ Ad under New Releases "Show More" */}
          <EffectiveGateNativeBanner />
        </>
      ) : (
        <div className="w-full gap-6 flex-colo py-12">
          <div className="flex-colo w-24 h-24 p-5 mb-4 rounded-full bg-dry text-customPurple text-4xl">
            <RiMovie2Line />
          </div>
          <p className="text-border text-sm">
            It seems like we don't have any movies
          </p>
        </div>
      )}
    </div>
  );

  // ✅ BrowseBy Film Industry: Ad moved BELOW Punjabi section
  const renderDesktopBrowseByContent = () => (
    <>
      <PopularMovies movies={movies} isLoading={isLoading} />

      <LazyLoadSection>
        <HollywoodSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <HollywoodHindiSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <BollywoodSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <KoreanDramaSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <KoreanSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <KoreanHindiSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <ChineseDramaSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <JapaneseSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <JapaneseAnimeSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <SouthIndianSection />
      </LazyLoadSection>
      <LazyLoadSection>
        <PunjabiSection />
      </LazyLoadSection>

      {/* ✅ AD BELOW PUNJABI (requested) */}
      <EffectiveGateNativeBanner />

      <LazyLoadSection height="400px">
        <Promos />
      </LazyLoadSection>
      <LazyLoadSection>
        <TopRated movies={topMovies} isLoading={topLoading} />
      </LazyLoadSection>

      {/* Bottom "Show More" button stays */}
      <div className="flex justify-center my-10">
        <Link
          to="/movies"
          className="bg-customPurple hover:bg-transparent border-2 border-customPurple text-white px-10 py-3 rounded-md font-semibold text-base transitions"
        >
          Show More
        </Link>
      </div>
    </>
  );

  const renderDesktopTabs = () => (
    <div className="flex items-center gap-4 my-6 border-b border-border pb-4">
      <button
        onClick={() => setActiveDesktopTab('latestNew')}
        className={`px-6 py-2.5 rounded-md font-semibold text-sm transitions ${
          activeDesktopTab === 'latestNew'
            ? 'bg-customPurple text-white'
            : 'bg-dry text-white hover:bg-customPurple/20 border border-border'
        }`}
      >
        Trending
      </button>

      <button
        onClick={() => setActiveDesktopTab('latest')}
        className={`px-6 py-2.5 rounded-md font-semibold text-sm transitions ${
          activeDesktopTab === 'latest'
            ? 'bg-customPurple text-white'
            : 'bg-dry text-white hover:bg-customPurple/20 border border-border'
        }`}
      >
        New Releases
      </button>

      <button
        onClick={() => setActiveDesktopTab('browseBy')}
        className={`px-6 py-2.5 rounded-md font-semibold text-sm transitions ${
          activeDesktopTab === 'browseBy'
            ? 'bg-customPurple text-white'
            : 'bg-dry text-white hover:bg-customPurple/20 border border-border'
        }`}
      >
        BrowseBy Film Industry
      </button>
    </div>
  );

  return (
    <Layout>
      <MetaTags
        title="MovieFrost - Watch Free Movies & Web Series Online in HD"
        description="Discover and stream thousands of the latest movies and web series for free on MovieFrost. Enjoy high-definition streaming without any registration."
        keywords="moviefrost, free movies, watch movies online, movie streaming, web series, HD movies"
        url="https://www.moviefrost.com"
      />

      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <div className="container mx-auto min-h-screen px-8 mobile:px-0 mb-6">
        {/* Banner */}
        <div className={activeMobileTab === 'browseBy' ? 'hidden sm:block' : ''}>
          <Banner
            movies={bannerFeed}
            isLoading={bannerMovies.length > 0 ? bannerLoading : isLoading}
            onRemoveFromBanner={
              bannerMovies.length > 0 ? handleRemoveFromBanner : undefined
            }
            removingBannerId={removingBannerId}
          />
        </div>

        {/* MOBILE */}
        <div className="sm:hidden">
          {activeMobileTab === 'home' && renderMobileHomeContent()}
          {activeMobileTab === 'browseBy' && renderMobileBrowseByContent()}
        </div>

        {/* DESKTOP */}
        <div className="hidden sm:block">
          {renderDesktopTabs()}

          {activeDesktopTab === 'latestNew' && renderDesktopLatestNewContent()}
          {activeDesktopTab === 'latest' && renderDesktopLatestContent()}
          {activeDesktopTab === 'browseBy' && renderDesktopBrowseByContent()}
        </div>
      </div>
    </Layout>
  );
}

export default HomeScreen;
