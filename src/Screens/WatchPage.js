import { trackVideoPlay, trackGuestAction, trackLoginPrompt } from '../utils/analytics';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { BiArrowBack } from 'react-icons/bi';
import { FaCloudDownloadAlt, FaHeart, FaPlay, FaLock } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getMovieByIdAction, getAllMoviesAction } from '../Redux/Actions/MoviesActions';
import Loader from '../Components/Loader';
import { RiMovie2Line } from 'react-icons/ri';
import { DownloadVideo, IfMovieLiked, LikeMovie } from '../Context/Functionalities';
import Titles from '../Components/Titles';
import { BsCollectionFill } from 'react-icons/bs';
import Movie from '../Components/movie';
import toast from 'react-hot-toast';

function WatchPage() {
  let { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [play, setPlay] = useState(false);
  const [guestWatchTime, setGuestWatchTime] = useState(0);

  // Guard flag to avoid repeated prompts
  const [hasShownLoginPrompt, setHasShownLoginPrompt] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // For Movies with 2 servers:
  const [currentServerIndex, setCurrentServerIndex] = useState(0);

  // For WebSeries episodes:
  const [currentEpisode, setCurrentEpisode] = useState(null);

  const sameClass = 'w-full gap-6 flex-colo min-h-screen';

  // Use Selector
  const { isLoading, isError, movie } = useSelector((state) => state.getMovieById);
  const { isLoading: likeLoading } = useSelector((state) => state.userLikeMovie);
  const { userInfo } = useSelector((state) => state.userLogin);
  const { movies } = useSelector((state) => state.getAllMovies);

  // Check if the movie is liked
  const isLiked = IfMovieLiked(movie);

  // Custom back navigation handler
  const handleBackClick = () => {
    if (location.state?.fromMoviesPage) {
      navigate('/movies', { state: { fromMovieDetail: true } });
    } else {
      navigate(`/movie/${movie?._id}`, { state: { fromMoviesPage: true } });
    }
  };

  // Track guest watch time + show modal (login prompt)
  useEffect(() => {
    let interval;
    if (play && !userInfo) {
      interval = setInterval(() => {
        setGuestWatchTime(prev => {
          const newTime = prev + 1;

          // Show login prompt after 13 minutes
          if (newTime >= 30 && !hasShownLoginPrompt) {
            setHasShownLoginPrompt(true);
            setPlay(false);

            // Save current state before redirecting
            const redirectState = {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
              scrollY: window.scrollY
            };
            localStorage.setItem('redirectAfterLogin', JSON.stringify(redirectState));

            trackLoginPrompt('watch_time_limit', `/watch/${id}`);
            trackGuestAction('watch_limit_reached', {
              movie_name: movie?.name,
              movie_id: movie?._id,
              watch_time: newTime
            });

            // Show forced login modal
            setShowLoginModal(true);
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [play, userInfo, hasShownLoginPrompt, id, movie, location]);

  // Add this to use guestWatchTime for analytics if needed
  useEffect(() => {
    return () => {
      if (guestWatchTime > 0 && !userInfo) {
        // Optional analytics on unmount
      }
    };
  }, [guestWatchTime, userInfo]);

  // Download movie video
  const DownloadMovieVideo = () => {
    if (!userInfo) {
      // Save current state before redirecting
      const redirectState = {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        scrollY: window.scrollY
      };
      localStorage.setItem('redirectAfterLogin', JSON.stringify(redirectState));

      trackGuestAction('download_attempt', {
        movie_name: movie?.name,
        movie_id: movie?._id
      });
      toast.error('Please login to download');
      navigate('/login');
      return;
    }

    if (movie && movie.type === 'Movie') {
      DownloadVideo(movie?.downloadUrl, userInfo);
    }
  };

  // Related movies (excluding the current movie)
  const RelatedMovies = movies?.filter(
    (m) => m.category === movie?.category && m._id !== movie?._id
  );

  // Fetch movie details and all movies
  useEffect(() => {
    dispatch(getMovieByIdAction(id));
    dispatch(getAllMoviesAction({}));
  }, [dispatch, id]);

  // For WebSeries, pick first episode by default
  useEffect(() => {
    if (
      movie &&
      movie.type === 'WebSeries' &&
      movie.episodes &&
      movie.episodes.length > 0
    ) {
      setCurrentEpisode(movie.episodes[0]);
    }
  }, [movie]);

  const handlePlayClick = () => {
    if (!userInfo) {
      trackGuestAction('play_attempt', {
        movie_name: movie?.name,
        movie_id: movie?._id,
        episode: currentEpisode?.episodeNumber || null
      });

      // Allow limited preview for guests
      setPlay(true);
      trackVideoPlay(movie.name, movie._id, currentEpisode?.episodeNumber || null);
    } else {
      setPlay(true);
      trackVideoPlay(movie.name, movie._id, currentEpisode?.episodeNumber || null);
    }
  };

  // Only action in modal now: Login Now
  const handleLoginNow = () => {
    navigate('/login');
  };

  // If it's a Movie, we have 2 possible servers to watch:
  const servers = [
    { label: 'Server 1', url: movie?.video },
    { label: 'Server 2', url: movie?.videoUrl2 },
  ];

  if (isLoading || !movie) {
    return (
      <Layout>
        <div className={sameClass}>
          <Loader />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className={sameClass}>
          <div className="flex-colo w-24 h-24 mb-4 rounded-full bg-dry text-customPurple">
            <RiMovie2Line />
          </div>
          <p className="text-border text-sm">{isError}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Forced Login Prompt Modal (no "Maybe later", no "Create account") */}
      {!userInfo && showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          {/* Modal card */}
          <div className="relative z-10 w-[95%] sm:w-[540px] max-w-[95%] bg-main border border-customPurple rounded-xl shadow-xl animate-slide-up">
            {/* Top bar */}
            <div className="flex items-center gap-3 p-4 border-b border-customPurple/50">
              <div className="w-10 h-10 rounded-full bg-customPurple text-white flex items-center justify-center shadow">
                <FaLock className="text-base" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">Continue watching - please log in for free</h3>
                <p className="text-xs text-text">Sign in for free to keep watching HD Movies and WebSeries.</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="bg-dry rounded-lg p-4 border border-customPurple/30">
                <p className="text-sm text-text">
                  You’ve reached the preview time limit for guests. Log in for free to continue watching without interruptions,
                  save favorites, and more.
                </p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-customPurple inline-block" />
                  Free HD streaming
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-customPurple inline-block" />
                  Watch from where you left
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-customPurple inline-block" />
                  Latest Movies and Shows
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-customPurple inline-block" />
                  Add to favorites
                </li>
              </ul>

              {/* Single action: Login now */}
              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={handleLoginNow}
                  className="w-full sm:w-auto px-5 py-2 rounded-md bg-customPurple text-white hover:bg-opacity-90 border-2 border-customPurple transitions flex items-center justify-center gap-2"
                >
                  <FaLock className="text-sm" />
                  Login now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-8 mobile:px-2 my-5">
        {/* Header section */}
        <div className="bg-main rounded-lg border border-gray-800 p-4 mobile:p-3 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mobile:gap-2">
            {/* Left side - Back button and movie title with like button on mobile */}
            <div className="flex items-center gap-3 mobile:gap-2 flex-1">
              <button
                onClick={handleBackClick}
                className="flex items-center gap-3 mobile:gap-2 text-dryGray hover:text-white transitions"
              >
                <BiArrowBack className="text-xl mobile:text-lg flex-shrink-0" />
                <h1 className="text-xl sm:text-2xl mobile:text-base font-bold mobile:line-clamp-1">{movie?.name}</h1>
              </button>

              {/* Like button - visible on mobile next to title */}
              <button
                onClick={() => LikeMovie(movie, dispatch, userInfo)}
                disabled={isLiked || likeLoading}
                className={`sm:hidden w-10 h-10 mobile:w-9 mobile:h-9 flex-colo rounded-md transitions ml-auto flex-shrink-0
                  ${isLiked
                    ? 'bg-customPurple text-white'
                    : 'bg-dry border border-border text-white hover:bg-customPurple'
                  }`}
              >
                <FaHeart className="text-base mobile:text-sm" />
              </button>
            </div>

            {/* Right side - Actions (hidden on mobile for like button, visible for download) */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Like button - desktop only */}
              <button
                onClick={() => LikeMovie(movie, dispatch, userInfo)}
                disabled={isLiked || likeLoading}
                className={`w-12 h-12 flex-colo rounded-md transitions
                  ${isLiked
                    ? 'bg-customPurple text-white'
                    : 'bg-dry border border-border text-white hover:bg-customPurple'
                  }`}
              >
                <FaHeart className="text-lg" />
              </button>

              {/* Download button - only for movies */}
              {movie.type === 'Movie' && movie.downloadUrl && (
                <button
                  onClick={DownloadMovieVideo}
                  className="bg-customPurple hover:bg-transparent border-2 border-customPurple transitions text-white rounded-md px-6 py-3 font-medium flex items-center gap-2"
                >
                  <FaCloudDownloadAlt className="text-lg" />
                  <span>Download</span>
                </button>
              )}
            </div>

            {/* Download button on mobile - shown separately */}
            {movie.type === 'Movie' && movie.downloadUrl && (
              <button
                onClick={DownloadMovieVideo}
                className="sm:hidden bg-customPurple hover:bg-transparent border-2 border-customPurple transitions text-white rounded-md px-4 py-2 mobile:text-sm font-medium flex items-center justify-center gap-2 w-full"
              >
                <FaCloudDownloadAlt className="text-base" />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>

        {movie.type === 'Movie' ? (
          // Handling Movie with 2 servers
          <div>
            {/* Server Selector */}
            <div className="flex flex-wrap gap-3 mb-5">
              {servers.map((server, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentServerIndex(idx);
                    setPlay(false);
                  }}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md font-medium transitions
                    ${currentServerIndex === idx
                      ? 'bg-customPurple text-white'
                      : 'bg-dry border border-border text-white hover:border-customPurple'
                    }
                  `}
                >
                  <span className="bg-white text-black text-xs font-bold px-2 py-0.5 rounded">
                    HD
                  </span>
                  {server.label}
                </button>
              ))}
            </div>

            {/* Video Player */}
            {play ? (
              <div className="w-full h-[75vh] mobile:h-[50vh] rounded-lg overflow-hidden relative bg-black">
                <div className="absolute top-4 right-4 bg-main text-white text-xs px-3 py-1.5 rounded-md z-10">
                  {servers[currentServerIndex].label}
                </div>
                {/* Video iframe */}
                <iframe
                  src={servers[currentServerIndex].url}
                  title={movie?.name}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="w-full h-[75vh] mobile:h-[50vh] rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-main bg-opacity-50 flex-colo z-10">
                  {/* Play Button Overlay */}
                  <button
                    onClick={handlePlayClick}
                    className="bg-white text-customPurple flex-colo border-2 border-white rounded-full w-20 h-20 font-medium text-xl hover:scale-110 transitions"
                  >
                    <FaPlay className="ml-1" />
                  </button>
                </div>
                <img
                  src={movie?.image ? movie.image : '/images/user.png'}
                  alt={movie?.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        ) : (
          // Handling Web Series
          <div>
            {/* Episode Selector */}
            {movie.episodes && movie.episodes.length > 0 ? (
              <div className="flex flex-wrap gap-3 mb-6">
                {movie.episodes.map((ep) => (
                  <button
                    key={ep._id}
                    onClick={() => {
                      setCurrentEpisode(ep);
                      setPlay(false);
                    }}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transitions
                      ${currentEpisode && currentEpisode._id === ep._id
                        ? 'bg-customPurple text-white'
                        : 'bg-dry border border-border text-white hover:border-customPurple'
                      }
                    `}
                  >
                    <span className="bg-white text-black text-xs font-bold px-2 py-0.5 rounded">
                      HD
                    </span>
                    <span>Episode {ep.episodeNumber}</span>
                    {ep.title && <span className="hidden sm:inline"> - {ep.title}</span>}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-border">No episodes available.</p>
            )}

            {currentEpisode && (
              <div>
                {play ? (
                  <div className="w-full h-[75vh] mobile:h-[50vh] rounded-lg overflow-hidden relative bg-black">
                    <div className="absolute top-4 right-4 bg-main text-white text-xs px-3 py-1.5 rounded-md z-10">
                      Episode {currentEpisode.episodeNumber}
                    </div>
                    {/* Video iframe */}
                    <iframe
                      src={currentEpisode.video}
                      title={currentEpisode.title || `Episode ${currentEpisode.episodeNumber}`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="w-full h-[75vh] mobile:h-[50vh] rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-main bg-opacity-50 flex-colo z-10">
                      {/* Play Button Overlay */}
                      <button
                        onClick={handlePlayClick}
                        className="bg-white text-customPurple flex-colo border-2 border-white rounded-full w-20 h-20 font-medium text-xl hover:scale-110 transitions"
                      >
                        <FaPlay className="ml-1" />
                      </button>
                    </div>
                    <img
                      src={movie?.image ? movie.image : '/images/user.png'}
                      alt={movie?.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Related Movies Section */}
        {RelatedMovies && RelatedMovies.length > 0 && (
          <div className="my-16">
            <Titles title="Related Movies" Icon={BsCollectionFill} />
            <div className="grid sm:mt-10 mt-6 xl:grid-cols-5 above-1000:grid-cols-5 lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-3 mobile:grid-cols-2 grid-cols-1 gap-4 mobile:gap-2">
              {RelatedMovies?.slice(0, 10).map((relatedMovie) => (
                <Movie key={relatedMovie?._id} movie={relatedMovie} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default WatchPage;
