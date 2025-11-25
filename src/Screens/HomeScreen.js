// Frontend/src/Screens/HomeScreen.js
import React, { useEffect, useMemo, useRef } from 'react';
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
import { useNavigationType } from 'react-router-dom';

function HomeScreen() {
  const dispatch = useDispatch();
  const navigationType = useNavigationType();

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

  // Banner Data Logic: now Banner uses the SAME movies list as Movies.js page 1
  const bannerFeed = useMemo(
    () => (Array.isArray(movies) ? movies : []),
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
        {/* --- ABOVE THE FOLD (Load Immediately) --- */}

        {/* Banner – now shows /movies page 1 data (latest/ordered like Movies.js) */}
        <Banner movies={bannerFeed} isLoading={isLoading} />

        {/* Page 1 carousel (same movies list) */}
        <PopularMovies movies={movies} isLoading={isLoading} />

        {/* --- BELOW THE FOLD (Lazy Load) --- */}

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
