// Frontend/src/Screens/SingleMovie.js
import { trackMovieView } from '../utils/analytics';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import MovieInfo from '../Components/Single/MovieInfo';
import MovieRates from '../Components/Single/MovieRates';
import Titles from '../Components/Titles';
import { BsCollectionFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../Components/Loader';
import Movie from '../Components/movie';
import ShareMovieModal from '../Components/Modals/ShareModal';
import {
  getMovieByIdAction,
  getAllMoviesAction,
} from '../Redux/Actions/MoviesActions';
import { DownloadVideo } from '../Context/Functionalities';
import MetaTags from '../Components/SEO/MetaTags';

function SingleMovie() {
  const [modalOpen, setModalOpen] = useState(false);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isLoading,
    isError, // string message when API fails
    movie,
  } = useSelector((state) => state.getMovieById || {});

  const { movies = [] } = useSelector(
    (state) => state.getAllMovies || { movies: [] }
  );

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

  const pageUrl = `https://www.moviefrost.com/movie/${id}`;
  const isNotFound = isError === 'Movie not found';
  const hasError = Boolean(isError);

  // ---------- SEO title / description ----------
  const seoTitle = movie
    ? `${movie.name} (${movie.year}) – Watch Online Free`
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
          ...(movie.type === 'Movie'
            ? {
                video: {
                  '@type': 'VideoObject',
                  name: `${movie.name} | MovieFrost`,
                  description: movie.seoDescription || movie.desc,
                  thumbnailUrl: movie.image || movie.titleImage,
                  uploadDate: movie.createdAt || movie.updatedAt || undefined,
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
        keywords={
          movie?.seoKeywords ||
          `${movie?.name || 'movie'}, ${movie?.category || ''}, ${
            movie?.language || ''
          } movies, watch online`
        }
        image={movie?.titleImage || movie?.image}
        url={pageUrl}
        type="movie"
        noindex={shouldNoIndex}
      />

      {movieStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(movieStructuredData)}
        </script>
      )}

      <div className="container mx-auto px-4 mobile:px-2 py-6 min-h-screen">
        {isLoading ? (
          <div className="flex-colo min-h-[60vh]">
            <Loader />
          </div>
        ) : hasError && !movie ? (
          // Error state with better message
          <div className="flex-colo min-h-[60vh] text-center text-white">
            <p className="text-lg font-semibold mb-4">
              {isNotFound
                ? 'Movie not found. It may have been removed from MovieFrost.'
                : 'Something went wrong while loading this movie.'}
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
            <MovieInfo
              movie={movie}
              setModalOpen={setModalOpen}
              DownloadVideo={handleDownloadMovieVideo}
              onBackClick={handleBackClick}
            />

            <div className="my-10">
              <MovieRates movie={movie} />
            </div>

            {relatedMovies?.length > 0 && (
              <div className="my-10">
                <Titles title="Related Movies" Icon={BsCollectionFill} />
                <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4 mt-6">
                  {relatedMovies.slice(0, 10).map((relatedMovie) => (
                    <Movie key={relatedMovie._id} movie={relatedMovie} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          // Very unlikely branch: no movie, no error
          <div className="flex-colo min-h-[60vh] text-center text-white">
            <p className="text-lg font-semibold mb-2">Movie not found</p>
            <button
              onClick={() => navigate('/movies')}
              className="px-4 py-2 rounded bg-customPurple hover:bg-opacity-80 transitions"
            >
              Go to Movies
            </button>
          </div>
        )}
      </div>

      <ShareMovieModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        movie={movie}
      />
    </Layout>
  );
}

export default SingleMovie;
