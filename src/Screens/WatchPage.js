// src/Screens/WatchPage.js
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
import MetaTags from '../Components/SEO/MetaTags';
import { FiLogIn } from 'react-icons/fi';

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

  // SEO configuration
  const pageUrl = `https://www.moviefrost.com/watch/${id}`;
  const seoTitle = movie
    ? `${movie.name} (${movie.year}) – Watch Online`
    : 'Watch Movie Online – MovieFrost';
  const seoDescription = movie
    ? `${movie.desc?.substring(0, 150) || ''} Watch instantly in HD on MovieFrost.`
    : 'Watch free movies and web series online in HD on MovieFrost.';
  
  // If movie failed to load, mark this watch URL as noindex
  const shouldNoIndex = !movie || Boolean(isError);

  // Custom back navigation handler
  const handleBackClick = () => {
    navigate(-1);
  };

  // Track guest watch time + show modal (login prompt)
  useEffect(() => {
    let interval;
    if (play && !userInfo) {
      interval = setInterval(() => {
        setGuestWatchTime(prev => {
          const newTime = prev + 1;

          // Show login prompt after 13 mintues 
          if (newTime >= 780 && !hasShownLoginPrompt) {
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

  useEffect(() => {
    dispatch(getMovieByIdAction(id));
    dispatch(getAllMoviesAction({}));
  }, [dispatch, id]);

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

  const servers = [
    { label: 'Server 1', url: movie?.video },
    { label: 'Server 2', url: movie?.videoUrl2 },
  ];

  if (isLoading || !movie) {
    return (
      <Layout>
        <MetaTags
          title="Loading... – MovieFrost"
          description="Loading movie content..."
          url={pageUrl}
          noindex={true}
        />
        <div className={sameClass}>
          <Loader />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <MetaTags
          title="Error Loading Movie – MovieFrost"
          description="Unable to load this movie at the moment."
          url={pageUrl}
          noindex={true}
        />
        <div className={sameClass}>
          <div className="flex-colo gap-6 w-full min-h-screen text-white">
            <p className="text-border text-2xl">{isError}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <MetaTags
        title={seoTitle}
        description={seoDescription}
        keywords={
          movie?.seoKeywords ||
          `${movie?.name || 'movie'}, ${movie?.category || ''}, ${
            movie?.language || ''
          } movies, watch online, streaming`
        }
        image={movie?.titleImage || movie?.image}
        url={`https://www.moviefrost.com/movie/${id}`} // Canonical to movie page
        type="video.movie"
        noindex={shouldNoIndex}
      />

      {/* Forced Login Prompt Modal */}
      {!userInfo && showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center px-4">
          <div className="bg-dry rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaLock className="text-customPurple text-2xl" />
              <h3 className="text-xl font-semibold text-white">
                Continue watching - please log in
              </h3>
            </div>
            <p className="text-text mb-6">
              Sign in for free to keep watching in HD and access downloads.
            </p>
            <div className="bg-border/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-text mb-3">
                You've reached the preview limit for guests. Log in for free to continue watching without interruptions,
                save favorites, and more.
              </p>
              <ul className="space-y-2 text-sm text-text">
                <li className="flex items-center gap-2">
                  <span className="text-customPurple">✓</span>
                  HD streaming
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-customPurple">✓</span>
                  Watch from where you left
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-customPurple">✓</span>
                  Download available
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-customPurple">✓</span>
                  Add to favorites
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-5 py-2 rounded-md bg-customPurple text-white hover:bg-opacity-90 border-2 border-customPurple transitions flex items-center justify-center gap-2"
              >
                <FiLogIn />
                Login now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 mobile:px-2 my-6">
        <div className="flex flex-col gap-6">
          {/* Back Button */}
          <div className="flex-btn flex-wrap mb-6 bg-main rounded border border-gray-800 p-6 mobile:p-3">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleBackClick}
                className="sm:hidden w-10 h-10 flex-colo rounded-md bg-dry transitions hover:bg-customPurple"
              >
                <BiArrowBack />
              </button>
              <button
                onClick={handleBackClick}
                className="hidden sm:flex md:text-xl text-sm flex items-center gap-3 font-bold text-dryGray"
              >
                <BiArrowBack /> {movie?.name}
              </button>
              <div className="flex-btn sm:w-auto w-full gap-5">
                <button
                  onClick={() => LikeMovie(movie, dispatch, userInfo)}
                  disabled={isLiked || likeLoading}
                  className={`sm:hidden w-10 h-10 mobile:w-9 mobile:h-9 flex-colo rounded-md transitions ml-auto flex-shrink-0
                    ${isLiked
                      ? 'bg-customPurple text-white'
                      : 'bg-dry border border-border text-white hover:bg-customPurple'
                    }`}
                >
                  <FaHeart />
                </button>
              </div>
            </div>

            <div className="flex items-center sm:w-auto gap-5">
              <button
                onClick={() => LikeMovie(movie, dispatch, userInfo)}
                disabled={isLiked || likeLoading}
                className={`hidden sm:flex w-12 h-12 flex-colo rounded-md transitions
                  ${isLiked
                    ? 'bg-customPurple text-white'
                    : 'bg-dry border border-border text-white hover:bg-customPurple'
                  }`}
              >
                <FaHeart />
              </button>

              {movie.type === 'Movie' && movie.downloadUrl && (
                <button
                  onClick={DownloadMovieVideo}
                  className="hidden md:flex bg-customPurple hover:bg-transparent border-2 border-customPurple transitions text-white rounded px-8 py-3 font-medium"
                >
                  <FaCloudDownloadAlt /> Download
                </button>
              )}
            </div>
            {movie.type === 'Movie' && movie.downloadUrl && (
              <button
                onClick={DownloadMovieVideo}
                className="md:hidden flex justify-center w-full bg-customPurple hover:bg-transparent border-2 border-customPurple transitions text-white rounded px-8 py-3 font-medium mt-4"
              >
                <FaCloudDownloadAlt className="mr-2" /> Download
              </button>
            )}
          </div>

          {/* Player Section */}
          {movie.type === 'Movie' ? (
            <>
              <div className="flex flex-wrap gap-3 mb-4">
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
                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
                      HD
                    </span>
                    {server.label}
                  </button>
                ))}
              </div>

              <div className="w-full h-screen rounded-lg overflow-hidden bg-main">
                {play ? (
                  <>
                    <div className="w-full h-10 bg-black text-white flex-colo">
                      {servers[currentServerIndex].label}
                    </div>
                    <iframe
                      className="w-full h-full"
                      src={servers[currentServerIndex].url}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={movie?.name}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex-colo">
                    <button
                      onClick={handlePlayClick}
                      className="bg-white text-customPurple flex-colo border border-customPurple rounded-full w-20 h-20 font-medium text-xl"
                    >
                      <FaPlay />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.episodes && movie.episodes.length > 0 ? (
                  movie.episodes.map((ep) => (
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
                      <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
                        HD
                      </span>
                      Episode {ep.episodeNumber}
                      {ep.title && ` - ${ep.title}`}
                    </button>
                  ))
                ) : (
                  <p className="text-text">No episodes available.</p>
                )}
              </div>

              {currentEpisode && (
                <div className="w-full h-screen rounded-lg overflow-hidden bg-main">
                  {play ? (
                    <>
                      <div className="w-full h-10 bg-black text-white flex-colo">
                        Episode {currentEpisode.episodeNumber}
                      </div>
                      <iframe
                        className="w-full h-full"
                        src={currentEpisode.video}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`${movie?.name} - Episode ${currentEpisode.episodeNumber}`}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex-colo">
                      <button
                        onClick={handlePlayClick}
                        className="bg-white text-customPurple flex-colo border border-customPurple rounded-full w-20 h-20 font-medium text-xl"
                      >
                        <FaPlay />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Related Movies Section */}
          {movies && movies.length > 0 && (
            <div className="my-16">
              <Titles title="Related Movies" Icon={BsCollectionFill} />
              <div className="grid sm:mt-10 mt-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
                {movies?.filter((m) => m.category === movie?.category && m._id !== movie?._id).slice(0, 10).map((relatedMovie) => (
                  <Movie key={relatedMovie?._id} movie={relatedMovie} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default WatchPage; 
