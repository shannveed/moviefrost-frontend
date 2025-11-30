// Frontend/src/Screens/SingleMovie.js
import { trackMovieView } from '../utils/analytics';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import MovieInfo from '../Components/Single/MovieInfo';
import MovieRates from '../Components/Single/MovieRates';
import Titles from '../Components/Titles';
import { BsCollectionFill } from 'react-icons/bs';
import {
  FaHeart,
  FaCloudDownloadAlt,
  FaPlay,
  FaShareAlt,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../Components/Loader';
import Movie from '../Components/movie';
import ShareMovieModal from '../Components/Modals/ShareModal';
import {
  getMovieByIdAction,
  getAllMoviesAction,
} from '../Redux/Actions/MoviesActions';
import { DownloadVideo, LikeMovie } from '../Context/Functionalities';
import MetaTags from '../Components/SEO/MetaTags';

function SingleMovie() {
  const [modalOpen, setModalOpen] = useState(false);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Movie details
  const {
    isLoading,
    isError,
    movie,
  } = useSelector((state) => state.getMovieById || {});

  // Global movies list (used for related movies)
  const { movies = [] } = useSelector(
    (state) => state.getAllMovies || { movies: [] }
  );

  // User & favorites (for mobile quick-actions)
  const { userInfo } = useSelector((state) => state.userLogin || {});
  const { likedMovies = [] } = useSelector(
    (state) => state.userGetFavoriteMovies || { likedMovies: [] }
  );
  const { isLoading: likeLoading } = useSelector(
    (state) => state.userLikeMovie || {}
  );

  const isLiked =
    movie && Array.isArray(likedMovies)
      ? likedMovies.some((liked) => liked?._id === movie._id)
      : false;

  // Related movies: same category, different id
  const relatedMovies = useMemo(
    () =>
      Array.isArray(movies)
        ? movies.filter(
            (m) => m.category === movie?.category && m._id !== movie?._id
          )
        : [],
    [movies, movie]
  );

  // Load movie + base list for related
  useEffect(() => {
    dispatch(getMovieByIdAction(id));
    dispatch(getAllMoviesAction({}));
  }, [dispatch, id]);

  // Track movie view for analytics
  useEffect(() => {
    if (movie && movie._id) {
      trackMovieView(movie.name, movie._id);
    }
  }, [movie]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDownloadMovieVideo = () => {
    if (movie?.downloadUrl) {
      DownloadVideo(movie.downloadUrl);
    }
  };

  // Mobile-only: quick action handlers
  const handleMobileWatch = () => {
    if (!movie?._id) return;
    navigate(`/watch/${movie._id}`);
  };

  const handleMobileLike = () => {
    if (!movie) return;
    LikeMovie(movie, dispatch, userInfo);
  };

  const pageUrl = `https://www.moviefrost.com/movie/${id}`;
  const isNotFound = isError === 'Movie not found';
  const hasError = Boolean(isError);

  // -------- redirect dead IDs to /404 --------
  useEffect(() => {
    if (isNotFound && !movie) {
      // SPA redirect so Google eventually sees /404 instead of /movie/<dead-id>
      navigate('/404', { replace: true });
    }
  }, [isNotFound, movie, navigate]);
  // -------------------------------------------------

  // Small helper to keep dates ISO
  const toIsoString = (value) => {
    if (!value) return undefined;
    try {
      return new Date(value).toISOString();
    } catch {
      return undefined;
    }
  };

  // ---------- Helper to build SEO title without double year ----------
  const buildMovieSeoTitle = (movieObj) => {
    if (!movieObj) {
      return 'Watch Movie Online Free – MovieFrost';
    }

    const yearStr = movieObj.year ? String(movieObj.year) : null;

    // If an explicit seoTitle is provided, clean "(YEAR) (YEAR)" → "(YEAR)"
    if (movieObj.seoTitle && typeof movieObj.seoTitle === 'string') {
      let s = movieObj.seoTitle.trim();
      if (yearStr) {
        // Match duplicate year patterns like "(2017) (2017)" or "(2017)(2017)" with optional spaces
        const duplicatePattern = new RegExp(
          `\\(\\s*${yearStr}\\s*\\)\\s*\\(\\s*${yearStr}\\s*\\)`,
          'g'
        );
        s = s.replace(duplicatePattern, `(${yearStr})`);
      }
      return s;
    }

    // Fallback: build "Watch {name}[ (YEAR)] Free Online HD"
    const baseName = (movieObj.name || 'Movie').trim();
    let nameWithYear = baseName;

    if (yearStr) {
      // Check if year is already in the name - match (YEAR) with optional spaces
      const yearPattern = new RegExp(`\\(\\s*${yearStr}\\s*\\)`);
      // Only append "(YEAR)" if it's not already in the name
      if (!yearPattern.test(baseName)) {
        nameWithYear = `${baseName} (${yearStr})`;
      }
    }

    // Final desired pattern: Watch It (2017) Free Online HD
    return `Watch ${nameWithYear} Free Online HD`;
  };

  // ---------- SEO title / description ----------
  const seoTitle = movie
    ? buildMovieSeoTitle(movie)
    : isNotFound
    ? 'Movie not found – MovieFrost'
    : 'Watch Movie Online Free – MovieFrost';

  const seoDescription = movie
    ? movie.seoDescription ||
      `${movie.desc?.substring(0, 150) || ''} Watch in HD for free on MovieFrost.`
    : isNotFound
    ? 'This movie is no longer available on MovieFrost.'
    : 'We were unable to load this movie right now. Please try again later.';

  // When there is no movie data or an error, tell Google not to index this URL
  const shouldNoIndex = !movie || hasError;

  // ---------- Structured data for SEO ----------

  const hasRating =
    movie &&
    typeof movie.numberOfReviews === 'number' &&
    movie.numberOfReviews > 0 &&
    typeof movie.rate === 'number' &&
    movie.rate > 0;

  // NEW: build individual Review JSON-LD (limit to first 5 reviews)
  const reviewsStructuredData =
    movie && Array.isArray(movie.reviews) && movie.reviews.length > 0
      ? movie.reviews.slice(0, 5).map((rev) => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: rev.userName || 'User',
          },
          datePublished: toIsoString(rev.createdAt || rev.updatedAt),
          reviewBody: rev.comment,
          name: `${movie.name} review`,
          reviewRating: {
            '@type': 'Rating',
            ratingValue:
              typeof rev.rating === 'number' ? rev.rating : undefined,
            bestRating: '5',
            worstRating: '0',
          },
        }))
      : null;

  const movieStructuredData =
    movie && !hasError
      ? {
          '@context': 'https://schema.org',
          '@type': 'Movie',
          name: movie.name,
          description: movie.seoDescription || movie.desc,
          image: movie.titleImage || movie.image,
          datePublished: movie.year ? String(movie.year) : undefined,
          genre: movie.category,
          duration: movie.time ? `PT${movie.time}M` : undefined,
          inLanguage: movie.language,
          url: `https://www.moviefrost.com/movie/${movie._id}`,
          ...(hasRating
            ? {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: movie.rate,
                  reviewCount: movie.numberOfReviews,
                  bestRating: '5',
                  worstRating: '0',
                },
              }
            : {}),
          ...(reviewsStructuredData && reviewsStructuredData.length
            ? { review: reviewsStructuredData }
            : {}),
          ...(movie.type === 'Movie'
            ? {
                video: {
                  '@type': 'VideoObject',
                  name: `${movie.name} | MovieFrost`,
                  description: movie.seoDescription || movie.desc,
                  thumbnailUrl: movie.image || movie.titleImage,
                  uploadDate: toIsoString(movie.createdAt || movie.updatedAt),
                  duration: movie.time ? `PT${movie.time}M` : undefined,
                  contentUrl: movie.downloadUrl || movie.video || undefined,
                  embedUrl: `https://www.moviefrost.com/watch/${movie._id}`,
                },
              }
            : {}),
        }
      : null;

  return (
    <Layout>
      {/* Always render meta tags; toggle indexing based on data/error */}
      <MetaTags
        title={seoTitle}
        description={seoDescription}
        image={movie?.titleImage || movie?.image}
        url={pageUrl}
        type="video.movie"
        noindex={shouldNoIndex}
      />

      {movieStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(movieStructuredData)}
        </script>
      )}

      {/* Extra bottom padding so content is not hidden behind mobile quick-actions + footer */}
      <div className="container mx-auto min-h-screen px-2 my-6 pb-24 sm:pb-8">
        {isLoading ? (
          <Loader />
        ) : hasError && !movie && !isNotFound ? (
          // Error state with better message (non-404 errors)
          <div className="flex-colo gap-6 py-12">
            <p className="text-border text-sm">
              Something went wrong while loading this movie.
            </p>
            <button
              onClick={() => dispatch(getMovieByIdAction(id))}
              className="px-4 py-2 rounded bg-customPurple hover:bg-opacity-80 transitions"
            >
              Try Again
            </button>
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
              DownloadVideo={handleDownloadMovieVideo}
              onBackClick={handleBackClick}
            />
            {/* Add id for potential "jump to reviews" in future */}
            <div className="my-12" id="reviews-section">
              <MovieRates movie={movie} />
            </div>
            {relatedMovies?.length > 0 && (
              <div className="my-16">
                <Titles title="Related Movies" Icon={BsCollectionFill} />
                <div className="grid sm:mt-10 mt-6 xl:grid-cols-5 2xl:grid-cols-5 lg:grid-cols-3 sm:grid-cols-2 mobile:grid-cols-2 grid-cols-1 gap-4 mobile:gap-3">
                  {relatedMovies.slice(0, 10).map((relatedMovie) => (
                    <Movie key={relatedMovie?._id} movie={relatedMovie} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          // Very unlikely branch: no movie, no error
          <div className="flex-colo gap-6 py-12">
            <p className="text-border text-sm">Movie not found</p>
            <button
              onClick={() => navigate('/movies')}
              className="px-4 py-2 rounded bg-customPurple hover:bg-opacity-80 transitions"
            >
              Go to Movies
            </button>
          </div>
        )}
      </div>

      {/* ============================= */}
      {/* Mobile Quick Actions (only)  */}
      {/* ============================= */}
      {movie && !isLoading && !hasError && (
        <div className="sm:hidden fixed z-40 bottom-16 left-0 right-0 px-3 pb-2">
          <div className="bg-main/95 border border-border rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
            {/* Watch */}
            <button
              onClick={handleMobileWatch}
              className="flex-1 flex items-center justify-center gap-2 bg-customPurple hover:bg-opacity-90 text-white text-sm font-semibold py-2 rounded-lg transitions"
            >
              <FaPlay className="text-sm" />
              <span>Watch</span>
            </button>

            {/* Download (only for movies with download URL) */}
            {movie.type === 'Movie' && movie.downloadUrl && (
              <button
                onClick={handleDownloadMovieVideo}
                className="px-3 py-2 rounded-lg border border-customPurple text-customPurple bg-main text-xs font-medium hover:bg-customPurple hover:text-white transitions"
              >
                <div className="flex items-center gap-1">
                  <FaCloudDownloadAlt className="text-sm" />
                  <span>Download</span>
                </div>
              </button>
            )}

            {/* Like */}
            <button
              onClick={handleMobileLike}
              disabled={isLiked || likeLoading}
              className={`w-9 h-9 flex items-center justify-center rounded-full border border-customPurple text-sm transitions ${
                isLiked
                  ? 'bg-customPurple text-white'
                  : 'bg-main text-white hover:bg-customPurple'
              }`}
              aria-label={isLiked ? 'In favorites' : 'Add to favorites'}
            >
              <FaHeart className="text-xs" />
            </button>

            {/* Share */}
            <button
              onClick={() => setModalOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-white bg-main hover:bg-customPurple transitions"
              aria-label="Share movie"
            >
              <FaShareAlt className="text-xs" />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default SingleMovie;
