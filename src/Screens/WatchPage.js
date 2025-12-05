// Frontend/src/Screens/WatchPage.js
import {
  trackVideoPlay,
  trackGuestAction,
  trackLoginPrompt,
} from '../utils/analytics';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { BiArrowBack } from 'react-icons/bi';
import { FaCloudDownloadAlt, FaHeart, FaPlay, FaLock } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  getMovieByIdAction,
  getAllMoviesAction,
} from '../Redux/Actions/MoviesActions';
import Loader from '../Components/Loader';
import { RiMovie2Line } from 'react-icons/ri';
import {
  DownloadVideo,
  IfMovieLiked,
  LikeMovie,
} from '../Context/Functionalities';
import Titles from '../Components/Titles';
import { BsCollectionFill } from 'react-icons/bs';
import Movie from '../Components/movie';
import toast from 'react-hot-toast';
import MetaTags from '../Components/SEO/MetaTags';
import { FiLogIn } from 'react-icons/fi';

function WatchPage() {
  const { id: routeParam } = useParams(); // can be slug or MongoId
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [play, setPlay] = useState(false);
  const [guestWatchTime, setGuestWatchTime] = useState(0);

  const [hasShownLoginPrompt, setHasShownLoginPrompt] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [currentServerIndex, setCurrentServerIndex] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState(null);

  const sameClass = 'w-full gap-6 flex-colo min-h-screen';

  const { isLoading, isError, movie } = useSelector(
    (state) => state.getMovieById
  );
  const { isLoading: likeLoading } = useSelector(
    (state) => state.userLikeMovie
  );
  const { userInfo } = useSelector((state) => state.userLogin);
  const { movies } = useSelector((state) => state.getAllMovies);

  const isLiked = IfMovieLiked(movie);
  const isNotFound = isError === 'Movie not found';

  // Redirect hard 404s to /404
  useEffect(() => {
    if (isNotFound && !isLoading && !movie) {
      navigate('/404', { replace: true });
    }
  }, [isNotFound, isLoading, movie, navigate]);

  // Redirect old /watch/<id> URLs to /watch/<slug> once movie is known
  useEffect(() => {
    if (movie && movie.slug && routeParam && routeParam !== movie.slug) {
      navigate(`/watch/${movie.slug}`, { replace: true });
    }
  }, [movie, routeParam, navigate]);

  // Helper to build SEO title without duplicate year from name
  const buildWatchSeoTitle = (movieObj) => {
    if (!movieObj) {
      return 'Watch Movie Online – MovieFrost';
    }
    const baseName = (movieObj.name || 'Movie').trim();
    const yearStr = movieObj.year ? String(movieObj.year) : '';
    let nameWithYear = baseName;

    if (yearStr) {
      const yearPattern = new RegExp(`\\(\\s*${yearStr}\\s*\\)`);
      if (!yearPattern.test(baseName)) {
        nameWithYear = `${baseName} (${yearStr})`;
      }
    }

    return `${nameWithYear} – Watch Online`;
  };

  // SEO configuration
  const pathSegmentForMeta = movie?.slug || routeParam;
  const pageUrl = `https://www.moviefrost.com/watch/${pathSegmentForMeta}`;
  const seoTitle = movie
    ? buildWatchSeoTitle(movie)
    : 'Watch Movie Online – MovieFrost';
  const seoDescription = movie
    ? `${movie.desc?.substring(0, 150) || ''} Watch instantly in HD on MovieFrost.`
    : 'Watch free movies and web series online in HD on MovieFrost.';

  const shouldNoIndex = !movie || Boolean(isError);

  const handleBackClick = () => {
    navigate(-1);
  };

  // Track guest watch time + show modal
  useEffect(() => {
    let interval;
    if (play && !userInfo) {
      interval = setInterval(() => {
        setGuestWatchTime((prev) => {
          const newTime = prev + 1;

          if (newTime >= 780 && !hasShownLoginPrompt) {
            setHasShownLoginPrompt(true);
            setPlay(false);

            const redirectState = {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
              scrollY: window.scrollY,
            };
            localStorage.setItem(
              'redirectAfterLogin',
              JSON.stringify(redirectState)
            );

            trackLoginPrompt('watch_time_limit', `/watch/${routeParam}`);
            trackGuestAction('watch_limit_reached', {
              movie_name: movie?.name,
              movie_id: movie?._id,
              watch_time: newTime,
            });

            setShowLoginModal(true);
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [play, userInfo, hasShownLoginPrompt, routeParam, movie, location]);

  useEffect(() => {
    if (routeParam) {
      dispatch(getMovieByIdAction(routeParam));
    }
    dispatch(getAllMoviesAction({}));
  }, [dispatch, routeParam]);

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
    if (!movie) return;

    if (!userInfo) {
      trackGuestAction('play_attempt', {
        movie_name: movie?.name,
        movie_id: movie?._id,
        episode: currentEpisode?.episodeNumber || null,
      });

      setPlay(true);
      trackVideoPlay(
        movie.name,
        movie._id,
        currentEpisode?.episodeNumber || null
      );
    } else {
      setPlay(true);
      trackVideoPlay(
        movie.name,
        movie._id,
        currentEpisode?.episodeNumber || null
      );
    }
  };

  const DownloadMovieVideo = () => {
    if (!movie) return;

    if (!userInfo) {
      const redirectState = {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        scrollY: window.scrollY,
      };
      localStorage.setItem(
        'redirectAfterLogin',
        JSON.stringify(redirectState)
      );

      trackGuestAction('download_attempt', {
        movie_name: movie?.name,
        movie_id: movie?._id,
      });
      toast.error('Please login to download');
      navigate('/login');
      return;
    }

    if (movie.type === 'Movie') {
      DownloadVideo(movie?.downloadUrl, userInfo);
    }
  };

  const servers = [
    { label: 'Server 1', url: movie?.video },
    { label: 'Server 2', url: movie?.videoUrl2 },
  ];

  // Early returns
  if (isNotFound && !isLoading && !movie) {
    return (
      <Layout>
        <div className={sameClass}>
          <div className="flex-colo w-24 h-24 p-5 mb-4 rounded-full bg-dry text-customPurple">
            <RiMovie2Line />
          </div>
          <p className="text-border text-sm">
            Movie not found. It may have been removed from MovieFrost.
          </p>
        </div>
      </Layout>
    );
  }

  if (isError && !isLoading && !movie && !isNotFound) {
    return (
      <Layout>
        <div className={sameClass}>
          <div className="flex-colo w-24 h-24 p-5 mb-4 rounded-full bg-dry text-customPurple">
            <RiMovie2Line />
          </div>
          <p className="text-border text-sm">{isError}</p>
        </div>
      </Layout>
    );
  }

  if (isLoading || !movie) {
    return (
      <Layout>
        <div className={sameClass}>
          <Loader />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <MetaTags
        title={seoTitle}
        description={seoDescription}
        image={movie?.titleImage || movie?.image}
        url={pageUrl}
        type="video.movie"
        noindex={shouldNoIndex}
      />

      {/* Forced Login Prompt Modal */}
      {!userInfo && showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 px-4">
          <div className="bg-dry rounded-lg p-6 max-w-md w-full text-center shadow-xl border border-border">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-customPurple/20 flex items-center justify-center">
              <FaLock className="text-customPurple text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Continue watching - please log in
            </h2>
            <p className="text-text text-sm mb-4">
              Sign in for free to keep watching in HD and access downloads.
            </p>
            <div className="bg-main rounded-lg p-4 mb-4 text-left">
              <p className="text-dryGray text-xs mb-3">
                You've reached the preview limit for guests. Log in for free to
                continue watching without interruptions, save favorites, and
                more.
              </p>
              <ul className="space-y-2 text-sm text-white">
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
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-5 py-2 rounded-md bg-customPurple text-white hover:bg-opacity-90 border-2 border-customPurple transitions flex items-center justify-center gap-2"
            >
              <FiLogIn />
              Login now
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto bg-dry p-6 mb-12">
        {/* Back Button */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={handleBackClick}
            className="sm:w-16 sm:h-16 w-10 h-10 flex-colo transitions hover:bg-customPurple rounded-md bg-main text-white flex-shrink-0"
          >
            <BiArrowBack className="sm:text-2xl text-lg" />
          </button>

          <div className="flex flex-1 items-center gap-3 min-w-0">
            <h1 className="sm:text-xl font-semibold truncate flex-1">
              {movie?.name}
            </h1>
            <button
              onClick={() => LikeMovie(movie, dispatch, userInfo)}
              disabled={isLiked || likeLoading}
              className={`sm:hidden w-10 h-10 mobile:w-9 mobile:h-9 flex-colo rounded-md transitions ml-auto flex-shrink-0
                ${
                  isLiked
                    ? 'bg-customPurple text-white'
                    : 'bg-dry border border-border text-white hover:bg-customPurple'
                }`}
            >
              <FaHeart className="text-base mobile:text-sm" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 ml-auto">
            <button
              onClick={() => LikeMovie(movie, dispatch, userInfo)}
              disabled={isLiked || likeLoading}
              className={`hidden sm:flex w-12 h-12 flex-colo rounded-md transitions
                ${
                  isLiked
                    ? 'bg-customPurple text-white'
                    : 'bg-dry border border-border text-white hover:bg-customPurple'
                }`}
            >
              <FaHeart />
            </button>

            {movie.type === 'Movie' && movie.downloadUrl && (
              <button
                onClick={DownloadMovieVideo}
                className="hidden sm:flex items-center gap-3 bg-customPurple hover:bg-transparent border-2 border-customPurple transitions text-white px-4 py-3 rounded font-medium"
              >
                <FaCloudDownloadAlt className="text-xl" /> Download
              </button>
            )}
          </div>

          {movie.type === 'Movie' && movie.downloadUrl && (
            <button
              onClick={DownloadMovieVideo}
              className="sm:hidden flex items-center justify-center gap-2 bg-customPurple hover:bg-transparent border-2 border-customPurple transitions text-white px-3 py-2 rounded font-medium text-sm flex-shrink-0"
            >
              <FaCloudDownloadAlt className="text-base" /> Download
            </button>
          )}
        </div>

        {/* Player Section */}
        {movie.type === 'Movie' ? (
          <div className="w-full">
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
                    ${
                      currentServerIndex === idx
                        ? 'bg-customPurple text-white'
                        : 'bg-dry border border-border text-white hover:border-customPurple'
                    }
                  `}
                >
                  <span className="text-[10px] px-1.5 py-0.5 bg-main rounded">
                    HD
                  </span>
                  {server.label}
                </button>
              ))}
            </div>

            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              {play ? (
                <iframe
                  title={servers[currentServerIndex].label}
                  src={servers[currentServerIndex].url}
                  frameBorder="0"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="absolute top-0 left-0 w-full h-full">
                  <div
                    className="w-full h-full rounded-lg overflow-hidden relative bg-main"
                    style={{
                      backgroundImage: `url(${
                        movie?.image || movie?.titleImage
                      })`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 flex-colo bg-black/40">
                      <button
                        onClick={handlePlayClick}
                        className="bg-white text-customPurple flex-colo border border-customPurple rounded-full w-20 h-20 font-medium text-xl hover:bg-customPurple hover:text-white transitions"
                      >
                        <FaPlay />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex flex-wrap gap-3 mb-4 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-main pr-2">
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
                      ${
                        currentEpisode && currentEpisode._id === ep._id
                          ? 'bg-customPurple text-white'
                          : 'bg-dry border border-border text-white hover:border-customPurple'
                      }
                    `}
                  >
                    <span className="text-[10px] px-1.5 py-0.5 bg-main rounded">
                      HD
                    </span>
                    Episode {ep.episodeNumber}
                    {ep.title && ` - ${ep.title}`}
                  </button>
                ))
              ) : (
                <p className="text-border">No episodes available.</p>
              )}
            </div>

            {currentEpisode && (
              <div
                className="relative w-full"
                style={{ paddingTop: '56.25%' }}
              >
                {play ? (
                  <iframe
                    title={`Episode ${currentEpisode.episodeNumber}`}
                    src={currentEpisode.video}
                    frameBorder="0"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div
                      className="w-full h-full rounded-lg overflow-hidden relative bg-main"
                      style={{
                        backgroundImage: `url(${
                          movie?.image || movie?.titleImage
                        })`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className="absolute inset-0 flex-colo bg-black/40">
                        <button
                          onClick={handlePlayClick}
                          className="bg-white text-customPurple flex-colo border border-customPurple rounded-full w-20 h-20 font-medium text-xl hover:bg-customPurple hover:text-white transitions"
                        >
                          <FaPlay />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Related Movies Section */}
        {movies && movies.length > 0 && (
          <div className="my-16">
            <Titles title="Related Movies" Icon={BsCollectionFill} />
            <div className="grid sm:mt-10 mt-6 xl:grid-cols-5 2xl:grid-cols-5 lg:grid-cols-3 sm:grid-cols-5 gap-6">
              {movies
                ?.filter(
                  (m) => m.category === movie?.category && m._id !== movie?._id
                )
                .slice(0, 10)
                .map((relatedMovie) => (
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
