// src/Screens/HomeScreen.js
import React, { useEffect, useRef, useMemo } from 'react';
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

  const {
    isLoading,
    isError,
    movies = [],
  } = useSelector((state) => state.getAllMovies || {});

  const {
    isLoading: randomLoading,
    isError:  randomError,
    movies:   randomMovies = [],
  } = useSelector((state) => state.getRandomMovies || {});

  const {
    isLoading: latestLoading,
    isError:   latestError,
    movies:    latestMovies = [],
  } = useSelector((state) => state.moviesLatest || {});

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

  const bannerFeed = useMemo(() => {
    if (latestMovies.length > 0) return latestMovies;
    if (randomMovies.length > 0) return randomMovies;
    return movies;
  }, [latestMovies, randomMovies, movies]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:  "MovieFrost - Free Movie Streaming",
    description: "Watch thousands of movies and web series online for free in HD quality",
    url:   "https://moviefrost.com",
  };

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

  const JANEASE_HINDI_VALUES = [
    'Japanese Web Series (Hindi)',
  ];

  const SOUTH_INDIAN_VALUES = [
    'South Indian (Hindi Dubbed)',
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

        {/* Latest carousel */}
        <PopularMovies movies={movies} isLoading={isLoading} />

        {/* Hollywood (English) */}
        <HollywoodSection browseList={HOLLYWOOD_BROWSE_VALUES} />

        {/* Korean */}
        <BrowseSection
          title="Korean"
          browseList={KOREAN_BROWSE_VALUES}
          link="/Korean"
          excludeList={['Korean (Hindi Dubbed)']}
        />

        {/* NEW: Chinese (Chinease Drama) – placed directly below Korean */}
        <BrowseSection
          title="Chinese"
          browseList={['Chinease Drama']}
          link="/Chinese"
        />

        {/* Bollywood */}
        <BrowseSection
          title="Bollywood"
          browseList={BOLLYWOOD_BROWSE_VALUES}
          link="/Bollywood"
        />

        {/* Hollywood Hindi */}
        <BrowseSection
          title="Hollywood Hindi"
          browseList={HOLLYWOOD_HINDI_BROWSE_VALUES}
          link="/Hollywood-Hindi"
        />

        {/* Korean Hindi */}
        <BrowseSection
          title="Korean Hindi"
          browseList={KOREAN_HINDI_BROWSE_VALUES}
          link="/Korean-Hindi"
        />

        {/* Japanease */}
        <BrowseSection
          title="Japanease"
          browseList={JAPAN_BROWSE_VALUES}
          link="/Japanease"
          excludeList={['Japanese Web Series (Hindi)']}
        />

        {/* Janease Hindi */}
        <BrowseSection
          title="Janease Hindi"
          browseList={JANEASE_HINDI_VALUES}
          link="/Janease-Hindi"
        />

        {/* South Indian */}
        <BrowseSection
          title="South Indian"
          browseList={SOUTH_INDIAN_VALUES}
          link="/South-Indian"
        />

        {/* Punjabi */}
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
