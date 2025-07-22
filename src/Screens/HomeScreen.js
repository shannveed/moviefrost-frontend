// HomeScreen.js - Updated to remove Ezoic placeholders
import React, { useEffect, useState, useRef } from 'react';
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
  getLatestMoviesAction 
} from '../Redux/Actions/MoviesActions';
import toast from 'react-hot-toast';
import { AdsterraBanner, AdsterraNative, PopAdsIntegration } from '../Components/Ads/AdWrapper';
import { AD_CONFIG } from '../Components/Ads/AdConfig';
import MetaTags from '../Components/SEO/MetaTags';

function HomeScreen() {
  const dispatch = useDispatch();
  const [adsEnabled, setAdsEnabled] = useState(false);
  const adsInitializedRef = useRef(false);
  
  const {
    isLoading: latestLoading = false,
    isError: latestError = null,
    movies: latestMovies = [],
  } = useSelector((state) => state.moviesLatest || {});

  const {
    isLoading: randomLoading = false,
    isError: randomError = null,
    movies: randomMovies = [],
  } = useSelector((state) => state.getRandomMovies || {});
  
  const {
    isLoading: topLoading = false,
    isError: topError = null,
    movies: topMovies = [],
  } = useSelector((state) => state.getTopRatedMovie || {});
  
  const { 
    isLoading = false, 
    isError = null, 
    movies = [] 
  } = useSelector((state) => state.getAllMovies || {});

  useEffect(() => {
    dispatch(getLatestMoviesAction()); 
    dispatch(getRandomMoviesAction());
    dispatch(getAllMoviesAction({}));
    dispatch(getTopRatedMovieAction());
    
    if (!adsInitializedRef.current) {
      const timer = setTimeout(() => {
        setAdsEnabled(process.env.REACT_APP_ADS_ENABLED !== 'false');
        adsInitializedRef.current = true;
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [dispatch]);

  useEffect(() => {
    if (latestError || isError || randomError || topError) {
      toast.error(latestError || isError || randomError || topError);
    }
  }, [latestError, isError, randomError, topError]);

  // Structured data for homepage
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "MovieFrost - Free Movie Streaming",
    "description": "Watch thousands of movies and web series online for free in HD quality",
    "url": "https://moviefrost.com",
    "publisher": {
      "@type": "Organization",
      "name": "MovieFrost",
      "logo": {
        "@type": "ImageObject",
        "url": "https://moviefrost.com/images/MOVIEFROST.png"
      }
    }
  };

  return (
    <Layout>
      <MetaTags 
        title="MovieFrost - Watch Free Movies & Web Series Online | HD Streaming"
        description="Stream unlimited movies and web series for free. Watch Hollywood, Bollywood films in HD quality. No registration required. Download movies for offline viewing."
        keywords="free movies online, watch movies free, stream movies HD, movie streaming site, web series online, download movies, Hollywood movies free, Bollywood movies online"
        url="https://moviefrost.com"
      />
      
      <script type="application/ld+json">
        {JSON.stringify(homeStructuredData)}
      </script>
      
      <div className="container mx-auto min-h-screen px-8 mobile:px-0 mb-6">
        <Banner 
          movies={randomMovies.length > 0 ? randomMovies : movies} 
          isLoading={isLoading || randomLoading || latestLoading} 
          latestMovies={latestMovies}
        />
        
        {adsEnabled && !adsInitializedRef.current && (
          <PopAdsIntegration 
            websiteId={process.env.REACT_APP_POPADS_WEBSITE_ID} 
            enabled={true}
          />
        )}
        
        {adsEnabled && (
          <AdsterraNative atOptions={AD_CONFIG.adsterra.native} />
        )}
        
        <PopularMovies movies={latestMovies} isLoading={latestLoading} />
        
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
