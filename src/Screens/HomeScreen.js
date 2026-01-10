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

// ✅ Latest New APIs + ✅ Banner APIs
import {
  getLatestNewMoviesService,
  getLatestNewMoviesAdminService,
  setLatestNewMoviesService,

  // ✅ NEW Banner APIs
  getBannerMoviesService,
  getBannerMoviesAdminService,
  setBannerMoviesService,
} from '../Redux/APIs/MoviesServices';

function HomeScreen() {
  const dispatch = useDispatch();
  const navigationType = useNavigationType();

  // Mobile main tab from context (home / browseBy)
  const { activeMobileTab } = useContext(SidebarContext);

  // Logged-in user (needed for admin remove)
  const { userInfo } = useSelector((state) => state.userLogin || {});

  // ✅ Mobile HOME sub-tabs (ONLY on mobile UI)
  // Latest New (default) | Latest Movies
  const [activeMobileHomeTab, setActiveMobileHomeTab] = useState('latestNew');

  // Desktop tab state (your existing behavior) — keep as-is
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

  // ✅ Latest New data (used by desktop tab + mobile tab)
  const [latestNewMovies, setLatestNewMovies] = useState([]);
  const [latestNewLoading, setLatestNewLoading] = useState(false);
  const [latestNewError, setLatestNewError] = useState(null);
  const [removingLatestNewId, setRemovingLatestNewId] = useState(null);

  // ✅ NEW: Banner data (HomeScreen Banner.js slider)
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
      // Critical: first page of movies (fallback banner + latest movies grid)
      dispatch(getAllMoviesAction({ pageNumber: 1 }));

      // Non-critical widgets
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
          userInfo?.isAdmin && userInfo?.token
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
  }, [userInfo?.isAdmin, userInfo?.token]);

  // Optional (recommended): show banner error toast
  useEffect(() => {
    if (bannerError) toast.error(bannerError);
  }, [bannerError]);

  // ✅ Fetch Latest New when:
  // - Desktop: activeDesktopTab === 'latestNew' (sm+ UI)
  // - Mobile: activeMobileTab === 'home' AND activeMobileHomeTab === 'latestNew' (mobile UI)
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
          userInfo?.isAdmin && userInfo?.token
            ? await getLatestNewMoviesAdminService(userInfo.token, 100)
            : await getLatestNewMoviesService(100);

        const list = Array.isArray(data) ? data : [];
        if (!cancelled) setLatestNewMovies(list.slice(0, 100));
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          'Failed to load Latest New titles';
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
    userInfo?.isAdmin,
    userInfo?.token,
  ]);

  // ✅ Admin-only: remove from Latest New (NOT delete from DB)
  const handleRemoveFromLatestNew = async (movieId) => {
    if (!userInfo?.isAdmin || !userInfo?.token) return;

    try {
      setRemovingLatestNewId(movieId);

      await setLatestNewMoviesService(userInfo.token, [movieId], false);

      setLatestNewMovies((prev) => prev.filter((m) => m._id !== movieId));
      toast.success('Removed from Latest New');
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          'Failed to remove from Latest New'
      );
    } finally {
      setRemovingLatestNewId(null);
    }
  };

  // ✅ Admin-only: remove from Banner (NOT delete / NOT remove from Movies list)
  const handleRemoveFromBanner = async (movieId) => {
    if (!userInfo?.isAdmin || !userInfo?.token) return;

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

  // ✅ Banner feed:
  // - If curated bannerMovies exists -> use it (10 max)
  // - else fallback to page-1 movies (keeps home alive if no banner titles yet)
  const bannerFeed = useMemo(() => {
    const curated = Array.isArray(bannerMovies) ? bannerMovies : [];
    if (curated.length > 0) return curated;
    return Array.isArray(movies) ? movies : [];
  }, [bannerMovies, movies]);

  // Latest Movies grid for home (page 1 slice)
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

  /* ================================
     MOBILE Home Tabs UI
     ================================ */
  const MobileHomeTabs = () => {
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

  // ✅ Mobile Latest New Tab content (shows 100 items)
  const MobileLatestNewTab = () => (
    <div className="sm:hidden">
      {latestNewLoading ? (
        <div className="w-full flex-colo py-12">
          <Loader />
        </div>
      ) : latestNewError ? (
        <p className="text-red-500 text-sm">{latestNewError}</p>
      ) : latestNewMovies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            {latestNewMovies.slice(0, 100).map((m) => (
              <div key={m._id} className="relative">
                {/* Admin-only remove button */}
                {userInfo?.isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromLatestNew(m._id);
                    }}
                    disabled={removingLatestNewId === m._id}
                    className="absolute top-2 right-2 z-30 w-9 h-9 flex-colo rounded-full bg-red-600/85 hover:bg-red-600 text-white disabled:opacity-60"
                    title="Remove from Latest New"
                    aria-label="Remove from Latest New"
                  >
                    {removingLatestNewId === m._id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <IoClose className="text-xl" />
                    )}
                  </button>
                )}

                <Movie movie={m} />
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
          <p className="text-border text-sm">
            No titles added to Latest New yet.
          </p>
        </div>
      )}
    </div>
  );

  // Mobile Latest Movies Tab content (existing behavior)
  const MobileLatestMoviesTab = () => (
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

  // ✅ Mobile Home Content (Latest New + Latest Movies tabs)
  const MobileHomeContent = () => (
    <div className="my-4 mobile:px-4">
      <MobileHomeTabs />

      {activeMobileHomeTab === 'latestNew' ? (
        <MobileLatestNewTab />
      ) : (
        <MobileLatestMoviesTab />
      )}
    </div>
  );

  // Mobile BrowseBy tab (unchanged)
  const MobileBrowseByContent = () => (
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

  // Desktop Latest New content (keep your existing behavior)
  const DesktopLatestNewContent = () => (
    <div className="my-8">
      {latestNewLoading ? (
        <div className="w-full flex-colo py-12">
          <Loader />
        </div>
      ) : latestNewError ? (
        <p className="text-red-500 text-sm">{latestNewError}</p>
      ) : latestNewMovies.length > 0 ? (
        <>
          <div className="grid xl:grid-cols-5 2xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 gap-4">
            {latestNewMovies.slice(0, 100).map((m) => (
              <div key={m._id} className="relative">
                {userInfo?.isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromLatestNew(m._id);
                    }}
                    disabled={removingLatestNewId === m._id}
                    className="absolute top-2 right-2 z-30 w-9 h-9 flex-colo rounded-full bg-red-600/80 hover:bg-red-600 text-white disabled:opacity-60"
                    title="Remove from Latest New"
                    aria-label="Remove from Latest New"
                  >
                    {removingLatestNewId === m._id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <IoClose className="text-xl" />
                    )}
                  </button>
                )}

                <Movie movie={m} />
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
        </>
      ) : (
        <div className="w-full gap-6 flex-colo py-12">
          <div className="flex-colo w-24 h-24 p-5 mb-4 rounded-full bg-dry text-customPurple text-4xl">
            <RiMovie2Line />
          </div>
          <p className="text-border text-sm">
            No titles added to Latest New yet.
          </p>
        </div>
      )}
    </div>
  );

  // Desktop Latest content (existing)
  const DesktopLatestContent = () => (
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

  // Desktop BrowseBy (existing)
  const DesktopBrowseByContent = () => (
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

      <LazyLoadSection height="400px">
        <Promos />
      </LazyLoadSection>
      <LazyLoadSection>
        <TopRated movies={topMovies} isLoading={topLoading} />
      </LazyLoadSection>
    </>
  );

  // Desktop tabs (existing)
  const DesktopTabs = () => (
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
        {/* Banner – desktop always; on mobile only on Home tab */}
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
          {activeMobileTab === 'home' && <MobileHomeContent />}
          {activeMobileTab === 'browseBy' && <MobileBrowseByContent />}
        </div>

        {/* DESKTOP */}
        <div className="hidden sm:block">
          <DesktopTabs />

          {activeDesktopTab === 'latestNew' && <DesktopLatestNewContent />}
          {activeDesktopTab === 'latest' && <DesktopLatestContent />}
          {activeDesktopTab === 'browseBy' && <DesktopBrowseByContent />}
        </div>
      </div>
    </Layout>
  );
}

export default HomeScreen;
