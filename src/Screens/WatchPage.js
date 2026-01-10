// Frontend/src/Screens/WatchPage.js
import {
  trackVideoPlay,
  trackGuestAction,
  trackLoginPrompt,
} from '../utils/analytics';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { BiArrowBack } from 'react-icons/bi';
import {
  FaCloudDownloadAlt,
  FaHeart,
  FaPlay,
  FaLock,
  FaListUl,
} from 'react-icons/fa';
import { TbPlayerTrackNext, TbPlayerTrackPrev } from 'react-icons/tb';
import { IoClose } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { getMovieByIdAction } from '../Redux/Actions/MoviesActions';
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

import {
  getRelatedMoviesService,
  getRelatedMoviesAdminService,
} from '../Redux/APIs/MoviesServices';

// ---------------- Helpers ----------------
const normalizeSeasonNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
};

const groupEpisodesBySeason = (episodes = []) => {
  const map = new Map();

  for (const ep of episodes || []) {
    const season = normalizeSeasonNumber(ep?.seasonNumber);
    if (!map.has(season)) map.set(season, []);
    map.get(season).push(ep);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([seasonNumber, eps]) => ({
      seasonNumber,
      episodes: (eps || [])
        .slice()
        .sort((a, b) => (a?.episodeNumber || 0) - (b?.episodeNumber || 0)),
    }));
};

const getFirstAvailableServerIndex = (servers = []) =>
  servers.findIndex((s) => s && typeof s.url === 'string' && s.url.trim());

// ---------------- Component ----------------
function WatchPage() {
  const { id: routeParam } = useParams(); // can be slug or MongoId
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const looksLikeObjectId = /^[0-9a-fA-F]{24}$/.test(routeParam || '');

  const [play, setPlay] = useState(false);
  const [guestWatchTime, setGuestWatchTime] = useState(0);

  const [hasShownLoginPrompt, setHasShownLoginPrompt] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // ✅ 3 servers (Movie + Episode)
  const [currentServerIndex, setCurrentServerIndex] = useState(0);

  // ✅ Seasons & better episode UX
  const [activeSeason, setActiveSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [showEpisodePicker, setShowEpisodePicker] = useState(false);

  // ✅ Related titles state (fetched from backend by category)
  const [relatedTitles, setRelatedTitles] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);

  const sameClass = 'w-full gap-6 flex-colo min-h-screen';

  const { isLoading, isError, movie } = useSelector(
    (state) => state.getMovieById
  );
  const { isLoading: likeLoading } = useSelector(
    (state) => state.userLikeMovie
  );
  const { userInfo } = useSelector((state) => state.userLogin);

  const isLiked = IfMovieLiked(movie);
  const isNotFound = isError === 'Movie not found';

  // ✅ Prevent background scroll while modals are open
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (showLoginModal || showEpisodePicker) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showLoginModal, showEpisodePicker]);

  // Redirect hard 404s to /404
  useEffect(() => {
    if (isNotFound && !isLoading && !movie) {
      navigate('/404', { replace: true });
    }
  }, [isNotFound, isLoading, movie, navigate]);

  // Redirect old /watch/<id> URLs to /watch/<slug>
  useEffect(() => {
    if (
      looksLikeObjectId &&
      movie &&
      movie.slug &&
      routeParam &&
      routeParam !== movie.slug
    ) {
      navigate(`/watch/${movie.slug}`, { replace: true });
    }
  }, [looksLikeObjectId, movie, routeParam, navigate]);

  // SEO helpers
  const buildWatchSeoTitle = (movieObj) => {
    if (!movieObj) return 'Watch Movie Online – MovieFrost';

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

  const pathSegmentForMeta = movie?.slug || routeParam;
  const pageUrl = `https://www.moviefrost.com/watch/${pathSegmentForMeta}`;
  const seoTitle = movie
    ? buildWatchSeoTitle(movie)
    : 'Watch Movie Online – MovieFrost';
  const seoDescription = movie
    ? `${movie.desc?.substring(0, 150) || ''} Watch instantly in HD on MovieFrost.`
    : 'Watch free movies and web series online in HD on MovieFrost.';
  const shouldNoIndex = !movie || Boolean(isError);

  const handleBackClick = () => navigate(-1);

  // Guest watch time + login modal
  useEffect(() => {
    let interval;

    if (play && !userInfo) {
      interval = setInterval(() => {
        setGuestWatchTime((prev) => {
          const newTime = prev + 1;

          if (newTime >= 780 && !hasShownLoginPrompt) {
            setHasShownLoginPrompt(true);

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

  // Fetch movie
  useEffect(() => {
    if (routeParam) dispatch(getMovieByIdAction(routeParam));
  }, [dispatch, routeParam]);

  // ✅ Build seasons from episodes
  const seasons = useMemo(() => {
    if (movie?.type !== 'WebSeries') return [];
    const eps = Array.isArray(movie?.episodes) ? movie.episodes : [];
    return groupEpisodesBySeason(eps);
  }, [movie?.type, movie?.episodes]);

  const activeSeasonEpisodes = useMemo(() => {
    if (movie?.type !== 'WebSeries') return [];
    const s = seasons.find((x) => x.seasonNumber === activeSeason);
    return s?.episodes || [];
  }, [movie?.type, seasons, activeSeason]);

  const filteredEpisodes = useMemo(() => {
    if (movie?.type !== 'WebSeries') return [];
    const term = episodeSearch.trim().toLowerCase();
    if (!term) return activeSeasonEpisodes;

    return activeSeasonEpisodes.filter((ep) => {
      const num = String(ep?.episodeNumber || '');
      const title = String(ep?.title || '').toLowerCase();
      return num.includes(term) || title.includes(term);
    });
  }, [movie?.type, activeSeasonEpisodes, episodeSearch]);

  // Set initial season+episode on load
  useEffect(() => {
    if (movie?.type !== 'WebSeries') return;

    if (!seasons.length) {
      setActiveSeason(1);
      setCurrentEpisode(null);
      return;
    }

    const firstSeason = seasons[0]?.seasonNumber || 1;
    setActiveSeason(firstSeason);

    const firstEp = seasons[0]?.episodes?.[0] || null;
    setCurrentEpisode(firstEp);

    setEpisodeSearch('');
    setCurrentServerIndex(0);
  }, [movie?._id, movie?.type, seasons]);

  // If user switches season, ensure current episode belongs to it
  useEffect(() => {
    if (movie?.type !== 'WebSeries') return;
    const s = seasons.find((x) => x.seasonNumber === activeSeason);
    if (!s) return;

    const exists = s.episodes.some(
      (ep) => String(ep?._id) === String(currentEpisode?._id)
    );
    if (!exists) {
      setCurrentEpisode(s.episodes[0] || null);
    }
  }, [activeSeason, seasons, movie?.type, currentEpisode?._id]);

  const selectEpisode = useCallback((ep) => {
    if (!ep) return;
    setCurrentEpisode(ep);
    setShowEpisodePicker(false);

    // keep playing if already playing
    // (iframe src changes + key forces remount)
    setPlay((prev) => prev);

    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const currentEpisodeIndex = useMemo(() => {
    if (!currentEpisode) return -1;
    return activeSeasonEpisodes.findIndex(
      (ep) => String(ep?._id) === String(currentEpisode?._id)
    );
  }, [activeSeasonEpisodes, currentEpisode]);

  const hasPrevEpisode = currentEpisodeIndex > 0;
  const hasNextEpisode =
    currentEpisodeIndex !== -1 &&
    currentEpisodeIndex < activeSeasonEpisodes.length - 1;

  const goPrevEpisode = () => {
    if (!hasPrevEpisode) return;
    selectEpisode(activeSeasonEpisodes[currentEpisodeIndex - 1]);
  };

  const goNextEpisode = () => {
    if (!hasNextEpisode) return;
    selectEpisode(activeSeasonEpisodes[currentEpisodeIndex + 1]);
  };

  // ✅ 3-server arrays
  const movieServers = useMemo(
    () => [
      { label: 'Server 1', url: movie?.video || '' },
      { label: 'Server 2', url: movie?.videoUrl2 || '' },
      { label: 'Server 3', url: movie?.videoUrl3 || '' },
    ],
    [movie?.video, movie?.videoUrl2, movie?.videoUrl3]
  );

  const episodeServers = useMemo(
    () => [
      { label: 'Server 1', url: currentEpisode?.video || '' },
      { label: 'Server 2', url: currentEpisode?.videoUrl2 || '' },
      { label: 'Server 3', url: currentEpisode?.videoUrl3 || '' },
    ],
    [currentEpisode?.video, currentEpisode?.videoUrl2, currentEpisode?.videoUrl3]
  );

  const activeServers = movie?.type === 'Movie' ? movieServers : episodeServers;

  // Ensure selected server is valid; otherwise jump to first available
  useEffect(() => {
    if (!activeServers?.length) return;

    const curUrl = activeServers[currentServerIndex]?.url;
    if (curUrl && curUrl.trim()) return;

    const first = getFirstAvailableServerIndex(activeServers);
    if (first !== -1 && first !== currentServerIndex) {
      setCurrentServerIndex(first);
    }
  }, [activeServers, currentServerIndex]);

  const activeVideoUrl =
    activeServers[currentServerIndex]?.url ||
    activeServers[getFirstAvailableServerIndex(activeServers)]?.url ||
    '';

  const handleServerSelect = (idx) => {
    const url = activeServers[idx]?.url;
    if (!url) return;
    setCurrentServerIndex(idx);
    setPlay((prev) => prev); // keep playing if already playing
  };

  const handlePlayClick = () => {
    if (!movie) return;

    if (movie.type === 'WebSeries' && !currentEpisode) {
      toast.error('No episode selected');
      return;
    }

    if (!activeVideoUrl) {
      toast.error('No playable server available for this title');
      return;
    }

    if (!userInfo) {
      trackGuestAction('play_attempt', {
        movie_name: movie?.name,
        movie_id: movie?._id,
        episode: currentEpisode?.episodeNumber || null,
        season: movie?.type === 'WebSeries' ? activeSeason : null,
      });
    }

    setPlay(true);
    trackVideoPlay(movie.name, movie._id, currentEpisode?.episodeNumber || null);
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
      localStorage.setItem('redirectAfterLogin', JSON.stringify(redirectState));

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

  // Reset related when route changes
  useEffect(() => {
    setRelatedTitles([]);
    setRelatedError(null);
    setRelatedLoading(false);
  }, [routeParam]);

  // Fetch related titles from backend by category
  useEffect(() => {
    let cancelled = false;

    const fetchRelated = async () => {
      if (!movie?._id) return;

      const idOrSlug = movie.slug || movie._id || routeParam;

      try {
        setRelatedLoading(true);
        setRelatedError(null);

        const data =
          userInfo?.isAdmin && userInfo?.token
            ? await getRelatedMoviesAdminService(userInfo.token, idOrSlug, 20)
            : await getRelatedMoviesService(idOrSlug, 20);

        const list = Array.isArray(data) ? data : [];
        if (!cancelled) setRelatedTitles(list);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          'Failed to load related titles';
        if (!cancelled) setRelatedError(msg);
      } finally {
        if (!cancelled) setRelatedLoading(false);
      }
    };

    fetchRelated();

    return () => {
      cancelled = true;
    };
  }, [movie?._id, movie?.slug, routeParam, userInfo?.isAdmin, userInfo?.token]);

  const relatedMoviesToShow = useMemo(() => {
    if (!Array.isArray(relatedTitles)) return [];
    return relatedTitles
      .filter((m) => m && m._id !== movie?._id)
      .slice(0, 20);
  }, [relatedTitles, movie?._id]);

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

      {/* Guest Login Prompt Modal */}
      {!userInfo && showLoginModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 px-4 py-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="min-h-full flex items-center justify-center mobile:landscape:items-start">
            <div className="bg-dry rounded-lg shadow-xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto p-6 mobile:landscape:max-w-lg mobile:landscape:p-4">
              <div className="text-center">
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
                    You've reached the preview limit for guests. Log in for free
                    to continue watching without interruptions, save favorites,
                    and more.
                  </p>

                  <ul className="space-y-2 text-sm text-white">
                    <li className="flex items-center gap-2">
                      <span className="text-customPurple">✓</span> HD streaming
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-customPurple">✓</span> Watch from where you left
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-customPurple">✓</span> Download available
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-customPurple">✓</span> Add to favorites
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
          </div>
        </div>
      )}

      {/* ✅ Mobile Episode Picker (bottom sheet) */}
      {movie?.type === 'WebSeries' && showEpisodePicker && (
        <div
          className="fixed inset-0 z-50 bg-black/70"
          onClick={() => setShowEpisodePicker(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-dry border-t border-border rounded-t-2xl p-4 max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h3 className="text-white font-semibold truncate">
                  Select Episode
                </h3>
                <p className="text-xs text-dryGray truncate">
                  Season {activeSeason} • {activeSeasonEpisodes.length} episodes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEpisodePicker(false)}
                className="w-10 h-10 flex-colo rounded-md bg-main border border-border text-white"
                aria-label="Close"
              >
                <IoClose />
              </button>
            </div>

            <div className="flex gap-2 mb-3">
              <select
                value={activeSeason}
                onChange={(e) => {
                  setEpisodeSearch('');
                  setActiveSeason(Number(e.target.value));
                }}
                className="flex-1 bg-main border border-border rounded px-3 py-2 text-sm text-white outline-none focus:border-customPurple"
              >
                {seasons.map((s) => (
                  <option key={s.seasonNumber} value={s.seasonNumber}>
                    Season {s.seasonNumber} ({s.episodes.length})
                  </option>
                ))}
              </select>

              <input
                value={episodeSearch}
                onChange={(e) => setEpisodeSearch(e.target.value)}
                placeholder="Search ep..."
                className="flex-1 bg-main border border-border rounded px-3 py-2 text-sm text-white outline-none focus:border-customPurple"
              />
            </div>

            <div className="overflow-y-auto max-h-[62vh] pr-1">
              <div className="grid grid-cols-2 gap-2">
                {filteredEpisodes.map((ep) => {
                  const active = String(ep._id) === String(currentEpisode?._id);
                  return (
                    <button
                      key={ep._id}
                      type="button"
                      onClick={() => selectEpisode(ep)}
                      className={`text-left p-3 rounded-lg border transitions ${
                        active
                          ? 'bg-customPurple border-customPurple text-white'
                          : 'bg-main border-border text-white hover:border-customPurple'
                      }`}
                    >
                      <p className="text-sm font-semibold">
                        Ep {ep.episodeNumber}
                      </p>
                      {ep.title ? (
                        <p className="text-xs text-dryGray line-clamp-2 mt-1">
                          {ep.title}
                        </p>
                      ) : (
                        <p className="text-xs text-dryGray mt-1">
                          Tap to play
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto bg-dry p-6 mobile:p-4 mb-12">
        {/* Header */}
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

            {/* Mobile Like */}
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
              className="sm:hidden flex items:center justify-center gap-2 bg-customPurple hover:bg-transparent border-2 border-customPurple transitions text-white px-3 py-2 rounded font-medium text-sm flex-shrink-0"
            >
              <FaCloudDownloadAlt className="text-base" /> Download
            </button>
          )}
        </div>

        {/* ✅ WebSeries season + episode controls */}
        {movie.type === 'WebSeries' && (
          <div className="mb-4 space-y-3">
            {/* Season selector (desktop pills) */}
            <div className="hidden sm:flex flex-wrap gap-2">
              {seasons.map((s) => (
                <button
                  key={s.seasonNumber}
                  type="button"
                  onClick={() => {
                    setEpisodeSearch('');
                    setActiveSeason(s.seasonNumber);
                  }}
                  className={`px-4 py-2 rounded-md font-medium border transitions ${
                    activeSeason === s.seasonNumber
                      ? 'bg-customPurple text-white border-customPurple'
                      : 'bg-main text-white border-border hover:border-customPurple'
                  }`}
                >
                  Season {s.seasonNumber} ({s.episodes.length})
                </button>
              ))}
            </div>

            {/* Season selector (mobile dropdown) + Episodes button */}
            <div className="sm:hidden flex gap-2">
              <select
                value={activeSeason}
                onChange={(e) => {
                  setEpisodeSearch('');
                  setActiveSeason(Number(e.target.value));
                }}
                className="flex-1 bg-main border border-border rounded px-3 py-2 text-sm text-white outline-none focus:border-customPurple"
              >
                {seasons.map((s) => (
                  <option key={s.seasonNumber} value={s.seasonNumber}>
                    Season {s.seasonNumber} ({s.episodes.length})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowEpisodePicker(true)}
                className="px-3 py-2 rounded bg-main border border-border text-white flex items-center gap-2"
              >
                <FaListUl />
                Episodes
              </button>
            </div>

            {/* Current episode + prev/next */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-dryGray truncate">
                {currentEpisode
                  ? `Season ${activeSeason} • Episode ${currentEpisode.episodeNumber}${currentEpisode.title ? ` — ${currentEpisode.title}` : ''}`
                  : `Season ${activeSeason}`}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrevEpisode}
                  disabled={!hasPrevEpisode}
                  className={`px-3 py-2 rounded bg-main border border-border text-white flex items-center gap-2 disabled:opacity-50`}
                >
                  <TbPlayerTrackPrev />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={goNextEpisode}
                  disabled={!hasNextEpisode}
                  className={`px-3 py-2 rounded bg-main border border-border text-white flex items-center gap-2 disabled:opacity-50`}
                >
                  Next
                  <TbPlayerTrackNext />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ 3-Server buttons (Movie + WebSeries) */}
        <div className="flex flex-wrap gap-3 mb-4">
          {activeServers.map((server, idx) => {
            const enabled = !!server.url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleServerSelect(idx)}
                disabled={!enabled}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md font-medium transitions border
                  ${
                    currentServerIndex === idx
                      ? 'bg-customPurple text-white border-customPurple'
                      : 'bg-dry text-white border-border hover:border-customPurple'
                  }
                  ${enabled ? '' : 'opacity-50 cursor-not-allowed'}
                `}
              >
                <span className="text-[10px] px-1.5 py-0.5 bg-main rounded">
                  HD
                </span>
                {server.label}
              </button>
            );
          })}
        </div>

        {/* Player */}
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          {play ? (
            <iframe
              key={`${movie?._id}:${movie?.type}:${activeSeason}:${currentEpisode?._id || 'movie'}:${currentServerIndex}:${activeVideoUrl}`}
              title={movie?.type === 'WebSeries'
                ? `S${activeSeason}E${currentEpisode?.episodeNumber || ''}`
                : activeServers[currentServerIndex]?.label}
              src={activeVideoUrl}
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
                  backgroundImage: `url(${movie?.image || movie?.titleImage})`,
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

        {/* Desktop episode list */}
        {movie.type === 'WebSeries' && (
          <div className="hidden sm:block mt-6 bg-main border border-border rounded-lg p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-white font-semibold">
                Episodes — Season {activeSeason}
              </h3>
              <input
                value={episodeSearch}
                onChange={(e) => setEpisodeSearch(e.target.value)}
                placeholder="Search episode..."
                className="bg-dry border border-border rounded px-3 py-2 text-sm text-white outline-none focus:border-customPurple w-64"
              />
            </div>

            <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
              {filteredEpisodes.map((ep) => {
                const active = String(ep._id) === String(currentEpisode?._id);
                return (
                  <button
                    key={ep._id}
                    type="button"
                    onClick={() => selectEpisode(ep)}
                    className={`text-left p-3 rounded-lg border transitions ${
                      active
                        ? 'bg-customPurple border-customPurple text-white'
                        : 'bg-dry border-border text-white hover:border-customPurple'
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      Ep {ep.episodeNumber}
                    </p>
                    {ep.title ? (
                      <p className="text-xs text-dryGray line-clamp-2 mt-1">
                        {ep.title}
                      </p>
                    ) : (
                      <p className="text-xs text-dryGray mt-1">Tap to play</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Related Movies/WebSeries */}
        <div className="my-16">
          <Titles title="Related Movies" Icon={BsCollectionFill} />

          {relatedLoading ? (
            <div className="mt-8">
              <Loader />
            </div>
          ) : relatedError ? (
            <p className="text-border text-sm mt-6">{relatedError}</p>
          ) : relatedMoviesToShow.length > 0 ? (
            <>
              <div className="grid sm:mt-10 mt-6 xl:grid-cols-5 2xl:grid-cols-5 lg:grid-cols-3 sm:grid-cols-5 mobile:grid-cols-2 mobile:gap-2 mobile:px-4 gap-4">
                {relatedMoviesToShow.map((relatedMovie) => (
                  <Movie key={relatedMovie?._id} movie={relatedMovie} />
                ))}
              </div>

              <div className="flex justify-center mt-10">
                <Link
                  to="/movies"
                  className="bg-customPurple hover:bg-transparent border-2 border-customPurple transitions text-white px-8 py-3 rounded font-medium"
                >
                  Show More
                </Link>
              </div>
            </>
          ) : (
            <p className="text-border text-sm mt-6">No related titles found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default WatchPage;
