// src/Screens/HomeScreen.js
import React, { useEffect, useMemo } from 'react';
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
import LazyLoadSection from '../Components/LazyLoadSection'; // Import the new component

function HomeScreen() {
  const dispatch = useDispatch();

  // Redux State
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

  // Initial Fetch - Critical Data Only (Banner, Latest)
  useEffect(() => {
    dispatch(getLatestMoviesAction());
    dispatch(getAllMoviesAction({ pageNumber: 1 }));
    
    // Optional: You can move these to LazyLoadSection logic if you want even faster initial load,
    // but keeping them here ensures data is ready for the bottom section if the user scrolls fast.
    dispatch(getRandomMoviesAction());
    dispatch(getTopRatedMovieAction());
  }, [dispatch]);

  // Error Handling
  useEffect(() => {
    if (isError || randomError || topError || latestError) {
      toast.error(isError || randomError || topError || latestError);
    }
  }, [isError, randomError, topError, latestError]);

  // Banner Data Logic
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

  // Browse Values
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
        
        {/* --- ABOVE THE FOLD (Load Immediately) --- */}
        
        {/* Banner */}
        <Banner
          movies={bannerFeed}
          isLoading={latestLoading || randomLoading}
        />

        {/* Latest carousel */}
        <PopularMovies movies={movies} isLoading={isLoading} />


        {/* --- BELOW THE FOLD (Lazy Load) --- */}

        {/* Hollywood (English) */}
        <LazyLoadSection>
          <HollywoodSection browseList={HOLLYWOOD_BROWSE_VALUES} />
        </LazyLoadSection>

        {/* Korean */}
        <LazyLoadSection>
          <BrowseSection
            title="Korean"
            browseList={KOREAN_BROWSE_VALUES}
            link="/Korean"
            excludeList={['Korean (Hindi Dubbed)']}
          />
        </LazyLoadSection>

        {/* Chinese */}
        <LazyLoadSection>
          <BrowseSection
            title="Chinese"
            browseList={['Chinease Drama']}
            link="/Chinese"
          />
        </LazyLoadSection>

        {/* Bollywood */}
        <LazyLoadSection>
          <BrowseSection
            title="Bollywood"
            browseList={BOLLYWOOD_BROWSE_VALUES}
            link="/Bollywood"
          />
        </LazyLoadSection>

        {/* Hollywood Hindi */}
        <LazyLoadSection>
          <BrowseSection
            title="Hollywood Hindi"
            browseList={HOLLYWOOD_HINDI_BROWSE_VALUES}
            link="/Hollywood-Hindi"
          />
        </LazyLoadSection>

        {/* Korean Hindi */}
        <LazyLoadSection>
          <BrowseSection
            title="Korean Hindi"
            browseList={KOREAN_HINDI_BROWSE_VALUES}
            link="/Korean-Hindi"
          />
        </LazyLoadSection>

        {/* Japanease */}
        <LazyLoadSection>
          <BrowseSection
            title="Japanease"
            browseList={JAPAN_BROWSE_VALUES}
            link="/Japanease"
            excludeList={['Japanese Web Series (Hindi)']}
          />
        </LazyLoadSection>

        {/* Janease Hindi */}
        <LazyLoadSection>
          <BrowseSection
            title="Janease Hindi"
            browseList={JANEASE_HINDI_VALUES}
            link="/Janease-Hindi"
          />
        </LazyLoadSection>

        {/* South Indian */}
        <LazyLoadSection>
          <BrowseSection
            title="South Indian"
            browseList={SOUTH_INDIAN_VALUES}
            link="/South-Indian"
          />
        </LazyLoadSection>

        {/* Punjabi */}
        <LazyLoadSection>
          <BrowseSection
            title="Punjabi"
            browseList={PUNJABI_VALUES}
            link="/Punjabi"
          />
        </LazyLoadSection>

        {/* Promos & Top Rated */}
        <LazyLoadSection height="400px">
          <Promos />
        </LazyLoadSection>

        <LazyLoadSection>
          <TopRated movies={topMovies} isLoading={topLoading} />
        </LazyLoadSection>

      </div>
    </Layout>
  );
}

export default HomeScreen;
