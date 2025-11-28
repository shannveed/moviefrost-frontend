// Frontend/src/Screens/HomeScreen.js
import React, {
  useEffect,
  useMemo,
  useRef,
  useContext,
  useState,
} from 'react';
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

function HomeScreen() {
  const dispatch = useDispatch();
  const navigationType = useNavigationType();

  // Get active mobile tab from context
  const { activeMobileTab } = useContext(SidebarContext);

  // Desktop tab state (separate from mobile), persisted across navigations
  const [activeDesktopTab, setActiveDesktopTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('homeDesktopTab');
      return stored === 'browseBy' ? 'browseBy' : 'latest';
    }
    return 'latest';
  });

  // Persist desktop tab selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('homeDesktopTab', activeDesktopTab);
    }
  }, [activeDesktopTab]);

  // Redux State
  const {
    isLoading,
    isError,
    movies = [],
  } = useSelector((state) => state.getAllMovies || {});

  const {
    isLoading: randomLoading,
    isError: randomError,
    movies: randomMovies = [],
  } = useSelector((state) => state.getRandomMovies || {});

  const {
    isLoading: latestLoading,
    isError: latestError,
    movies: latestMovies = [],
  } = useSelector((state) => state.moviesLatest || {});

  const {
    isLoading: topLoading,
    isError: topError,
    movies: topMovies = [],
  } = useSelector((state) => state.getTopRatedMovie || {});

  // Ensure we only trigger the initial loads once per app lifetime
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      dispatch(getAllMoviesAction({ pageNumber: 1 }));
      dispatch(getLatestMoviesAction());
      dispatch(getRandomMoviesAction());
      dispatch(getTopRatedMovieAction());
    } catch (error) {
      console.error('Error loading initial home data:', error);
      toast.error('Error loading data. Please refresh the page.');
    }
  }, [dispatch]);

  // Restore scroll position when returning to Home via browser back
  useEffect(() => {
    if (navigationType === 'POP') {
      const saved = sessionStorage.getItem('homeScrollY');
      if (saved) {
        setTimeout(() => {
          window.scrollTo(0, Number(saved) || 0);
        }, 50);
      }
    } else {
      // New navigation to "/" → reset any old scroll
      sessionStorage.removeItem('homeScrollY');
    }
  }, [navigationType]);

  // Save scroll position whenever HomeScreen unmounts
  useEffect(() => {
    return () => {
      sessionStorage.setItem('homeScrollY', String(window.scrollY || 0));
    };
  }, []);

  // Error Handling
  useEffect(() => {
    if (isError || randomError || topError || latestError) {
      toast.error(isError || randomError || topError || latestError);
    }
  }, [isError, randomError, topError, latestError]);

  // Banner Data Logic: Banner uses the SAME movies list as Movies.js page 1
  const bannerFeed = useMemo(
    () => (Array.isArray(movies) ? movies : []),
    [movies]
  );

  // Get first 50 movies for the Latest/Home tab grid (same as Movies.js page 1)
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

  // Mobile Home Tab Content - 50 movies grid with Show More button
  const MobileHomeContent = () => (
    <div className="my-4 mobile:px-4">
      {isLoading ? (
        <div className="w-full flex-colo py-12">
          <Loader />
        </div>
      ) : latestGridMovies.length > 0 ? (
        <>
          {/* Section Title */}
          <h2 className="text-lg font-semibold text-white mb-4">
            Latest Movies
          </h2>

          {/* Movie Grid - 2 columns on mobile */}
          <div className="grid grid-cols-2 gap-2">
            {latestGridMovies.map((movie) => (
              <Movie key={movie._id} movie={movie} />
            ))}
          </div>

          {/* Show More Button */}
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
        /* Empty State */
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

  // Mobile BrowseBy Tab Content - All category sections
  const MobileBrowseByContent = () => (
    <div className="mb-20">
      {/* PopularMovies Carousel */}
      <PopularMovies movies={movies} isLoading={isLoading} />

      {/* Hollywood (English) */}
      <LazyLoadSection>
        <HollywoodSection />
      </LazyLoadSection>

      {/* Hollywood Hindi */}
      <LazyLoadSection>
        <HollywoodHindiSection />
      </LazyLoadSection>

      {/* Bollywood */}
      <LazyLoadSection>
        <BollywoodSection />
      </LazyLoadSection>

      {/* Korean Drama */}
      <LazyLoadSection>
        <KoreanDramaSection />
      </LazyLoadSection>

      {/* Korean Movies/Webseries */}
      <LazyLoadSection>
        <KoreanSection />
      </LazyLoadSection>

      {/* Korean Hindi */}
      <LazyLoadSection>
        <KoreanHindiSection />
      </LazyLoadSection>

      {/* Chinese */}
      <LazyLoadSection>
        <ChineseDramaSection />
      </LazyLoadSection>

      {/* Japanese */}
      <LazyLoadSection>
        <JapaneseSection />
      </LazyLoadSection>

      {/* Japanese Anime */}
      <LazyLoadSection>
        <JapaneseAnimeSection />
      </LazyLoadSection>

      {/* South Indian */}
      <LazyLoadSection>
        <SouthIndianSection />
      </LazyLoadSection>

      {/* Punjabi */}
      <LazyLoadSection>
        <PunjabiSection />
      </LazyLoadSection>

      {/* Promos */}
      <LazyLoadSection height="400px">
        <Promos />
      </LazyLoadSection>

      {/* Top Rated */}
      <LazyLoadSection>
        <TopRated movies={topMovies} isLoading={topLoading} />
      </LazyLoadSection>
    </div>
  );

  // Desktop Latest Tab Content - 50 movies grid with Show More button
  const DesktopLatestContent = () => (
    <div className="my-8">
      {isLoading ? (
        <div className="w-full flex-colo py-12">
          <Loader />
        </div>
      ) : latestGridMovies.length > 0 ? (
        <>
          {/* Movie Grid - 5 columns on desktop */}
          <div className="grid xl:grid-cols-5 2xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 gap-4">
            {latestGridMovies.map((movie) => (
              <Movie key={movie._id} movie={movie} />
            ))}
          </div>

          {/* Show More Button */}
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
        /* Empty State */
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

  // Desktop BrowseBy Industry Tab Content - All category sections
  const DesktopBrowseByContent = () => (
    <>
      {/* PopularMovies Carousel */}
      <PopularMovies movies={movies} isLoading={isLoading} />

      {/* Hollywood (English) */}
      <LazyLoadSection>
        <HollywoodSection />
      </LazyLoadSection>

      {/* Hollywood Hindi */}
      <LazyLoadSection>
        <HollywoodHindiSection />
      </LazyLoadSection>

      {/* Bollywood */}
      <LazyLoadSection>
        <BollywoodSection />
      </LazyLoadSection>

      {/* Korean Drama */}
      <LazyLoadSection>
        <KoreanDramaSection />
      </LazyLoadSection>

      {/* Korean Movies/Webseries */}
      <LazyLoadSection>
        <KoreanSection />
      </LazyLoadSection>

      {/* Korean Hindi */}
      <LazyLoadSection>
        <KoreanHindiSection />
      </LazyLoadSection>

      {/* Chinese */}
      <LazyLoadSection>
        <ChineseDramaSection />
      </LazyLoadSection>

      {/* Japanese */}
      <LazyLoadSection>
        <JapaneseSection />
      </LazyLoadSection>

      {/* Japanese Anime */}
      <LazyLoadSection>
        <JapaneseAnimeSection />
      </LazyLoadSection>

      {/* South Indian */}
      <LazyLoadSection>
        <SouthIndianSection />
      </LazyLoadSection>

      {/* Punjabi */}
      <LazyLoadSection>
        <PunjabiSection />
      </LazyLoadSection>

      {/* Promos */}
      <LazyLoadSection height="400px">
        <Promos />
      </LazyLoadSection>

      {/* Top Rated */}
      <LazyLoadSection>
        <TopRated movies={topMovies} isLoading={topLoading} />
      </LazyLoadSection>
    </>
  );

  // Desktop Tabs Component
  const DesktopTabs = () => (
    <div className="flex items-center gap-4 my-6 border-b border-border pb-4">
      <button
        onClick={() => setActiveDesktopTab('latest')}
        className={`px-6 py-2.5 rounded-md font-semibold text-sm transitions ${
          activeDesktopTab === 'latest'
            ? 'bg-customPurple text-white'
            : 'bg-dry text-white hover:bg-customPurple/20 border border-border'
        }`}
      >
        Latest
      </button>
      <button
        onClick={() => setActiveDesktopTab('browseBy')}
        className={`px-6 py-2.5 rounded-md font-semibold text-sm transitions ${
          activeDesktopTab === 'browseBy'
            ? 'bg-customPurple text-white'
            : 'bg-dry text-white hover:bg-customPurple/20 border border-border'
        }`}
      >
        BrowseBy Industry
      </button>
    </div>
  );

  return (
    <Layout>
      <MetaTags
        title="MovieFrost - Watch Free Movies & Web Series Online in HD"
        description="Discover and stream thousands of the latest movies and web series for free on MovieFrost. Enjoy high-definition streaming without any registration. Your ultimate source for online entertainment."
        keywords="moviefrost, free movies, watch movies online, movie streaming, web series, HD movies, online cinema, latest movies"
        url="https://www.moviefrost.com"
      />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <div className="container mx-auto min-h-screen px-8 mobile:px-0 mb-6">
        {/* Banner – shows /movies page 1 data */}
        <Banner movies={bannerFeed} isLoading={isLoading} />

        {/* ============================================================ */}
        {/* MOBILE LAYOUT - Conditional based on activeMobileTab        */}
        {/* ============================================================ */}
        <div className="sm:hidden">
          {activeMobileTab === 'home' && <MobileHomeContent />}
          {activeMobileTab === 'browseBy' && <MobileBrowseByContent />}
        </div>

        {/* ============================================================ */}
        {/* DESKTOP LAYOUT - With Tabs (Latest / BrowseBy Industry)     */}
        {/* ============================================================ */}
        <div className="hidden sm:block">
          {/* Desktop Tabs */}
          <DesktopTabs />

          {/* Desktop Tab Content */}
          {activeDesktopTab === 'latest' && <DesktopLatestContent />}
          {activeDesktopTab === 'browseBy' && <DesktopBrowseByContent />}
        </div>
      </div>
    </Layout>
  );
}

export default HomeScreen;
