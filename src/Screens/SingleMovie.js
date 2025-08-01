import { trackMovieView } from '../utils/analytics';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../Layout/Layout';
import MovieInfo from '../Components/Single/MovieInfo';
import MovieRates from '../Components/Single/MovieRates';
import Titles from '../Components/Titles';
import { BsCollectionFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../Components/Loader';
import { RiMovie2Line } from 'react-icons/ri';
import ShareMovieModal from '../Components/Modals/ShareModal';
import { getMovieByIdAction, getAllMoviesAction } from '../Redux/Actions/MoviesActions';
import { DownloadVideo } from '../Context/Functionalities';
import Movie from '../Components/movie';
import { AdsterraNative, MonetagBanner } from '../Components/Ads/AdWrapper';
import { AD_CONFIG } from '../Components/Ads/AdConfig';
import MetaTags from '../Components/SEO/MetaTags'; // SEO Improvement

function SingleMovie() {
  const [modalOpen, setModalOpen] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(false);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const sameClass = 'w-full gap-6 flex-colo min-h-screen';

  const { isLoading, isError, movie } = useSelector((state) => state.getMovieById || {});
  const { movies = [] } = useSelector((state) => state.getAllMovies || {});

  const RelatedMovies = movies?.filter(
    (m) => m.category === movie?.category && m._id !== movie?._id
  );

  const DownloadMovieVideo = () => {
    if (movie?.downloadUrl) {
      DownloadVideo(movie.downloadUrl);
    }
  };

  const handleBackClick = () => {
    if (location.state?.fromMoviesPage) {
      navigate('/movies', { state: { fromMovieDetail: true } });
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    dispatch(getMovieByIdAction(id));
    if (RelatedMovies.length === 0) {
      dispatch(getAllMoviesAction({ category: movie?.category }));
    }
    
    const timer = setTimeout(() => {
      setAdsEnabled(process.env.REACT_APP_ADS_ENABLED !== 'false');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [dispatch, id, movie?.category]);

  useEffect(() => {
    if (movie && movie._id) {
      trackMovieView(movie.name, movie._id);
    }
  }, [movie]);

  // SEO Improvement: Structured data for the specific movie
  const movieStructuredData = movie ? {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.name,
    "description": movie.seoDescription || movie.desc,
    "image": movie.image,
    "datePublished": movie.year,
    "genre": movie.category,
    "duration": `PT${movie.time}M`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": movie.rate,
      "reviewCount": movie.numberOfReviews,
      "bestRating": "5",
      "worstRating": "0"
    },
    "inLanguage": movie.language,
    "url": `https://www.moviefrost.com/movie/${movie._id}`,
    "keywords": movie.seoKeywords || `${movie.name}, watch ${movie.name} online, ${movie.category}, ${movie.language}`,
    "director": movie.casts?.length > 0 ? { "@type": "Person", "name": movie.casts[0].name } : undefined
  } : null;

  return (
    <Layout>
      {/* SEO Improvement: Dynamic meta tags and structured data */}
      {movie && (
        <>
          <MetaTags 
            title={movie.seoTitle || `Watch ${movie.name} (${movie.year}) Free Online HD`}
            description={movie.seoDescription || `${movie.desc?.substring(0, 155)}... Watch ${movie.name} online free in HD quality.`}
            keywords={movie.seoKeywords || `${movie.name}, watch ${movie.name} online, ${movie.name} free, ${movie.category} movies, ${movie.language} movies, ${movie.year} movies`}
            image={movie.titleImage || movie.image}
            url={`/movie/${id}`}
            type="video.movie"
          />
          {movieStructuredData && (
            <script type="application/ld+json">
              {JSON.stringify(movieStructuredData)}
            </script>
          )}
        </>
      )}
      
      {isLoading ? (
        <div className={sameClass}>
          <Loader />
        </div>
      ) : isError ? (
        <div className={sameClass}>
          <div className="flex-colo w-24 h-24 p-5 mb-4 rounded-full bg-dry text-customPurple text-4xl">
            <RiMovie2Line />
          </div>
          <p className="text-border text-sm">Something went wrong</p>
        </div>
      ) : movie ? (
        <>
          <ShareMovieModal
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            movie={movie}
          />

          <MovieInfo
            movie={movie}
            setModalOpen={setModalOpen}
            DownloadVideo={DownloadMovieVideo}
            onBackClick={handleBackClick}
          />

          <div className="container mx-auto min-h-screen px-8 mobile:px-4 my-6">
            {adsEnabled && <AdsterraNative atOptions={AD_CONFIG.adsterra.native} />}
            
            <MovieRates movie={movie} />
            
            {adsEnabled && AD_CONFIG.monetag.banner.enabled && (
              <MonetagBanner 
                zoneId={AD_CONFIG.monetag.banner.zoneId}
                width={728}
                height={90}
                className="my-8"
              />
            )}

            {RelatedMovies?.length > 0 && (
              <div className="my-16">
                <Titles title="Related Movies" Icon={BsCollectionFill} />
                <div className="grid sm:mt-10 mt-6 xl:grid-cols-5 above-1000:grid-cols-5 lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-3 grid-cols-1 gap-4 mobile:gap-0">
                  {RelatedMovies?.slice(0, 10).map((relatedMovie) => (
                    <Movie key={relatedMovie?._id} movie={relatedMovie} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
         <div className={sameClass}>
            <div className="flex-colo w-24 h-24 p-5 mb-4 rounded-full bg-dry text-customPurple text-4xl">
              <RiMovie2Line />
            </div>
            <p className="text-border text-sm">Movie could not be found.</p>
          </div>
      )}
    </Layout>
  );
}

export default SingleMovie;
