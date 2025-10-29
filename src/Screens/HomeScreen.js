// src/Screens/HomeScreen.js
import React, { useEffect, useRef } from 'react';
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

import HollywoodSection from '../Components/Home/HollywoodSection';
import BrowseSection from '../Components/Home/BrowseSection';

function HomeScreen() {
  const dispatch = useDispatch();
  const adsEnabled = false;
  const adsInitRef = useRef(false);

  // Popular movies for the grid/carousel
  const {
    isLoading,
    isError,
    movies = [],
  } = useSelector((state) => state.getAllMovies || {});

  // Random 8
  const {
    isLoading: randomLoading,
    isError:  randomError,
    movies:   randomMovies = [],
  } = useSelector((state) => state.getRandomMovies || {});

  // LATEST (flagged) – banner
  const {
    isLoading: latestLoading,
    isError:   latestError,
    movies:    latestMovies = [],
  } = useSelector((state) => state.moviesLatest || {});

  // Top rated
  const {
    isLoading: topLoading,
    isError:   topError,
    movies:    topMovies = [],
  } = useSelector((state) => state.getTopRatedMovie || {});

  useEffect(() => {
    dispatch(getLatestMoviesAction());
    dispatch(getAllMoviesAction({ pageNumber: 1 }));
    dispatch(getRandomMoviesAction());
    dispatch(getTopRatedMovieAction());
  }, [dispatch]);

  useEffect(() => {
    if (isError || randomError || topError || latestError) {
      toast.error(isError || randomError || topError || latestError);
    }
  }, [isError, randomError, topError, latestError]);

  const bannerFeed =
    latestMovies.length > 0
      ? latestMovies
      : randomMovies.length > 0
      ? randomMovies
      : movies;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:  "MovieFrost - Free Movie Streaming",
    description: "Watch thousands of movies and web series online for free in HD quality",
    url:   "https://moviefrost.com",
  };

  // Existing sections
  const HOLLYWOOD_BROWSE_VALUES = [
    'British (English)',
    'Hollywood (English)',
    'Hollywood Web Series (English)',
  ];

  const KOREAN_BROWSE_VALUES = [
    'Korean (English)',
    'Korean Drama (Korean)',
  ];

  const BOLLYWOOD_BROWSE_VALUES = [
    'Bollywood (Hindi)',
    'Bollywood Web Series (Hindi)',
    'Bollywood Web Series',
  ];

  const HOLLYWOOD_HINDI_BROWSE_VALUES = [
    'Hollywood (Hindi Dubbed)',
    'Hollywood Web Series (Hindi Dubbed)',
    'Hollywood( Hindi Dubbed)',
  ];

  const KOREAN_HINDI_BROWSE_VALUES = [
    'Korean (Hindi Dubbed)',
  ];

  const JAPAN_BROWSE_VALUES = [
    'Japanese (Movies)',
    'Japanese Web Series',
    'Japanese Web Series (Hindi)',
  ];

  // NEW: five sections requested
  const JANEASE_HINDI_VALUES = [
    'Japanese Web Series (Hindi)',
  ];

  const TURKISH_VALUES = [
    'Turkish',
  ];

  const SOUTH_INDIAN_VALUES = [
    'South Indian (Hindi Dubbed)',
  ];

  const WRESTLING_VALUES = [
    'WWE Wrestling',
  ];

  const PUNJABI_VALUES = [
    'Indian Punjabi Movies',
  ];

  return (
    <Layout>
      <MetaTags
        title="MovieFrost - Watch Free Movies & Web Series Online in HD"
        description="Discover and stream thousands of the latest movies and web series for free on MovieFrost. Enjoy high-definition streaming without any registration. Your ultimate source for online entertainment."
        keywords="moviefrost, free movies, watch movies online, movie streaming, web series, HD movies, online cinema, latest movies"
        url="https://www.moviefrost.com"
      />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <div className="container mx-auto min-h-screen px-8 mobile:px-0 mb-6">
        {/* Banner */}
        <Banner
          movies={bannerFeed}
          isLoading={latestLoading || randomLoading}
        />

        {/* Latest carousel (up to 20) */}
        <PopularMovies movies={movies} isLoading={isLoading} />

        {/* Hollywood (English) section */}
        <HollywoodSection browseList={HOLLYWOOD_BROWSE_VALUES} />

        {/* More sections */}
        <BrowseSection
          title="Korean"
          browseList={KOREAN_BROWSE_VALUES}
          link="/Korean"
        />

        <BrowseSection
          title="Bollywood"
          browseList={BOLLYWOOD_BROWSE_VALUES}
          link="/Bollywood"
        />

        <BrowseSection
          title="Hollywood Hindi"
          browseList={HOLLYWOOD_HINDI_BROWSE_VALUES}
          link="/Hollywood-Hindi"
        />

        <BrowseSection
          title="Korean Hindi"
          browseList={KOREAN_HINDI_BROWSE_VALUES}
          link="/Korean-Hindi"
        />

        <BrowseSection
          title="Japanese"
          browseList={JAPAN_BROWSE_VALUES}
          link="/Japanease"
        />

        {/* NEW SECTIONS BELOW JAPAN */}
        <BrowseSection
          title="Japanese Hindi"
          browseList={JANEASE_HINDI_VALUES}
          link="/Janease-Hindi"
        />

        <BrowseSection
          title="Turkish"
          browseList={TURKISH_VALUES}
          link="/Turkish"
        />

        <BrowseSection
          title="South Indian"
          browseList={SOUTH_INDIAN_VALUES}
          link="/South-Indian"
        />

        <BrowseSection
          title="Wrestling"
          browseList={WRESTLING_VALUES}
          link="/Wrestling"
        />

        <BrowseSection
          title="Punjabi"
          browseList={PUNJABI_VALUES}
          link="/Punjabi"
        />

        <Promos />
        <TopRated movies={topMovies} isLoading={topLoading} />
      </div>
    </Layout>
  );
}

export default HomeScreen;
