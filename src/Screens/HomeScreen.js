// HomeScreen.js
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
import {
  AdsterraBanner,
  AdsterraNative,
  PopAdsIntegration,
} from '../Components/Ads/AdWrapper';
import { AD_CONFIG } from '../Components/Ads/AdConfig';
import MetaTags from '../Components/SEO/MetaTags';
import useAdsAllowed from '../hooks/useAdsAllowed'; // NEW

function HomeScreen() {
  const dispatch = useDispatch();
  const adsEnabled = useAdsAllowed(); // NEW
  const adsInitRef = useRef(false);

  /* ---------------- REDUX SELECTORS ---------------- */

  // Popular-movies list (page 1 of /movies)
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

  // LATEST (flagged) – for the banner
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

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    dispatch(getLatestMoviesAction());
    dispatch(getAllMoviesAction({ pageNumber: 1 }));
    dispatch(getRandomMoviesAction());
    dispatch(getTopRatedMovieAction());

    if (adsEnabled && !adsInitRef.current) {
      adsInitRef.current = true; // PopAds only once
    }
  }, [dispatch, adsEnabled]);

  /* ---------------- ERROR HANDLING ---------------- */
  useEffect(() => {
    if (isError || randomError || topError || latestError) {
      toast.error(isError || randomError || topError || latestError);
    }
  }, [isError, randomError, topError, latestError]);

  /* ---------------- BANNER FEED PRIORITY ----------------
        1) latestMovies (flagged)
        2) random sample
        3) generic list                                          */
  const bannerFeed =
    latestMovies.length > 0
      ? latestMovies
      : randomMovies.length > 0
      ? randomMovies
      : movies;

  /* ---------------- SEO META ---------------- */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:  "MovieFrost - Free Movie Streaming",
    description: "Watch thousands of movies and web series online for free in HD quality",
    url:   "https://moviefrost.com",
  };

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
        {/* ------------ BANNER (Latest-flag first) ------------ */}
        <Banner
          movies={bannerFeed}
          isLoading={latestLoading || randomLoading}
        />

        {/* Ads etc. stay the same */}
        {adsEnabled && !adsInitRef.current && (
          <PopAdsIntegration
            enabled
            websiteId={process.env.REACT_APP_POPADS_WEBSITE_ID}
          />
        )}
        {adsEnabled && <AdsterraNative atOptions={AD_CONFIG.adsterra.native} />}

        {/* Latest grid (unchanged) */}
        <PopularMovies movies={movies} isLoading={isLoading} />

        {adsEnabled && (
          <>
            <div className="hidden md:block">
              <AdsterraBanner atOptions={AD_CONFIG.adsterra.banner.desktop} />
            </div>
            <div className="block md:hidden">
              <AdsterraBanner atOptions={AD_CONFIG.adsterra.banner.mobile} />
            </div>
          </>
        )}

        <Promos />

        <TopRated movies={topMovies} isLoading={topLoading} />
      </div>
    </Layout>
  );
}

export default HomeScreen;
