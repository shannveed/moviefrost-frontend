// Frontend/src/Screens/Movies.js
import { trackGuestAction } from '../utils/analytics';
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Filters from '../Components/Filters';
import Layout from '../Layout/Layout';
import { TbPlayerTrackNext, TbPlayerTrackPrev } from 'react-icons/tb';
import Movie from '../Components/movie';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getAllMoviesAction } from '../Redux/Actions/MoviesActions';
import Loader from '../Components/Loader';
import { RiMovie2Line } from 'react-icons/ri';
import {
  LanguageData,
  RatesData,
  TimesData,
  YearData,
  browseByData,
} from '../Data/FilterData';
import { useParams, useSearchParams } from 'react-router-dom';
import MetaTags from '../Components/SEO/MetaTags';
import {
  reorderMoviesInPageService,
  moveMoviesToPageService,
  setLatestNewMoviesService,
  setBannerMoviesService,
} from '../Redux/APIs/MoviesServices';

// ✅ NEW: Native Banner Ad
import EffectiveGateNativeBanner from '../Components/Ads/EffectiveGateNativeBanner';

const MOVIES_PAGE_STATE_KEY = 'moviesPageState';
const MOVIES_PAGE_RESTORE_KEY = 'moviesPageRestorePending';

function MoviesPage() {
  const { search } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const browseByParam = searchParams.get('browseBy') || '';

  const dispatch = useDispatch();

  const hasRestoredState = useRef(false);
  const scrollPositionRef = useRef(0);

  // Filter states with default values
  const [category, setCategory] = useState({ title: 'All Categories' });
  const [year, setYear] = useState(YearData[0]);
  const [times, setTimes] = useState(TimesData[0]);
  const [rates, setRates] = useState(RatesData[0]);
  const [language, setLanguage] = useState(LanguageData[0]);
  const [browseBy, setBrowseBy] = useState(browseByData[0]);

  // Keep this aligned with URL (helps state consistency)
  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number(searchParams.get('page') || 1);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  const sameClass =
    'text-white py-2 px-4 rounded font-semibold border-2 border-customPurple hover:bg-customPurple';

  const { isLoading, isError, movies, pages, page } = useSelector(
    (state) => state.getAllMovies
  );
  const { userInfo } = useSelector((state) => state.userLogin);
  const { categories } = useSelector((state) => state.categoryGetAll);

  const isAdmin = !!userInfo?.isAdmin;

  // ============= ADMIN ORDERING STATE =============
  const [adminMode, setAdminMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [localOrder, setLocalOrder] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const [hasPendingReorder, setHasPendingReorder] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [movingPage, setMovingPage] = useState(false);

  // ✅ Latest New state
  const [settingLatestNew, setSettingLatestNew] = useState(false);

  // ✅ Banner state
  const [settingBanner, setSettingBanner] = useState(false);

  // Sync localOrder with Redux movies when page changes
  useEffect(() => {
    if (isAdmin && adminMode && Array.isArray(movies)) {
      setLocalOrder([...movies]);
      setHasPendingReorder(false);
      setDraggedId(null);
    } else {
      setLocalOrder([]);
      setHasPendingReorder(false);
      setDraggedId(null);
    }
  }, [movies, isAdmin, adminMode, page]);

  const displayMovies =
    isAdmin && adminMode && Array.isArray(localOrder) && localOrder.length
      ? localOrder
      : movies;

  // ========== ✅ FIX: only restore state when we explicitly came back from movie click ==========
  useEffect(() => {
    if (hasRestoredState.current) return;

    let restorePending = false;
    try {
      restorePending = sessionStorage.getItem(MOVIES_PAGE_RESTORE_KEY) === '1';
    } catch {
      restorePending = false;
    }

    // If NOT coming back from a movie click, do NOT restore old session state.
    // This keeps Google deep-links like /movies?page=45 working perfectly.
    if (!restorePending) {
      const urlPage = Number(searchParams.get('page') || 1);
      if (Number.isFinite(urlPage) && urlPage > 0) {
        setCurrentPage(urlPage);
      }
      return;
    }

    // One-shot: clear the restore flag immediately
    try {
      sessionStorage.removeItem(MOVIES_PAGE_RESTORE_KEY);
    } catch {}

    let savedStateRaw = null;
    try {
      savedStateRaw = sessionStorage.getItem(MOVIES_PAGE_STATE_KEY);
    } catch {
      savedStateRaw = null;
    }

    if (!savedStateRaw) {
      hasRestoredState.current = true;
      return;
    }

    try {
      const state = JSON.parse(savedStateRaw);

      if (Date.now() - state.timestamp < 30 * 60 * 1000) {
        setCategory(state.category || { title: 'All Categories' });
        setYear(state.year || YearData[0]);
        setTimes(state.times || TimesData[0]);
        setRates(state.rates || RatesData[0]);
        setLanguage(state.language || LanguageData[0]);
        setBrowseBy(state.browseBy || browseByData[0]);
        setCurrentPage(state.page || 1);
        scrollPositionRef.current = state.scrollPosition || 0;
      }
    } catch (e) {
      console.error('Error restoring movies page state:', e);
    } finally {
      hasRestoredState.current = true;
    }
  }, [searchParams]);

  // Selected IDs toggling
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = () => setSelectedIds([]);

  // Drag handlers
  const handleDragStart = (e, id) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  };

  const handleDragEnter = (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    setLocalOrder((prev) => {
      if (!Array.isArray(prev) || !prev.length) return prev;
      const currentIndex = prev.findIndex((m) => m._id === draggedId);
      const targetIndex = prev.findIndex((m) => m._id === targetId);
      if (currentIndex === -1 || targetIndex === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(currentIndex, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });

    setHasPendingReorder(true);
  };

  const handleDragEnd = () => setDraggedId(null);

  // Build queries helper
  const buildQueries = useCallback(() => {
    return {
      category:
        category?.title === 'All Categories' ? '' : category?.title || '',
      time: times?.title.replace(/\D/g, ''),
      language:
        language?.title === 'Sort By Language' ? '' : language?.title || '',
      rate: rates?.title.replace(/\D/g, ''),
      year: year?.title.replace(/\D/g, ''),
      browseBy:
        browseByParam ||
        (browseBy?.title === 'Browse By' ? '' : browseBy?.title || ''),
      search: search ? search : '',
    };
  }, [category, times, language, rates, year, browseBy, browseByParam, search]);

  // Save page order to backend
  const handleSaveOrder = async () => {
    if (!isAdmin || !adminMode) return;
    if (!Array.isArray(localOrder) || !localOrder.length) return;

    if (!userInfo?.token) {
      toast.error('You must be logged in as admin.');
      return;
    }

    try {
      setSavingOrder(true);
      const orderedIds = localOrder.map((m) => m._id);
      await reorderMoviesInPageService(userInfo.token, page, orderedIds);
      toast.success('Order updated for this page');
      setHasPendingReorder(false);

      const queries = buildQueries();
      dispatch(getAllMoviesAction({ ...queries, pageNumber: page }));
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save order';
      toast.error(msg);
    } finally {
      setSavingOrder(false);
    }
  };

  // Move selected (or single) movie(s) to a target page
  const handleMoveToPage = async (baseMovieId, targetPage) => {
    if (!isAdmin) return;
    if (!userInfo?.token) {
      toast.error('You must be logged in as admin.');
      return;
    }

    const idsToMove =
      selectedIds && selectedIds.length > 0 ? selectedIds : [baseMovieId];

    try {
      setMovingPage(true);
      await moveMoviesToPageService(userInfo.token, targetPage, idsToMove);
      toast.success(
        `Moved ${idsToMove.length} item${idsToMove.length > 1 ? 's' : ''} to page ${targetPage}`
      );
      clearSelection();

      const queries = buildQueries();
      dispatch(getAllMoviesAction({ ...queries, pageNumber: page }));
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to move movies to target page';
      toast.error(msg);
    } finally {
      setMovingPage(false);
    }
  };

  // Add to Latest New
  const handleAddToLatestNew = async (baseMovieId) => {
    if (!isAdmin) return;
    if (!userInfo?.token) {
      toast.error('You must be logged in as admin.');
      return;
    }

    const idsToUpdate =
      selectedIds && selectedIds.length > 0 ? selectedIds : [baseMovieId];

    try {
      setSettingLatestNew(true);
      await setLatestNewMoviesService(userInfo.token, idsToUpdate, true);
      toast.success(
        `Added ${idsToUpdate.length} item${idsToUpdate.length > 1 ? 's' : ''} to Latest New`
      );
      clearSelection();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to add to Latest New';
      toast.error(msg);
    } finally {
      setSettingLatestNew(false);
    }
  };

  // Add to Banner
  const handleAddToBanner = async (baseMovieId) => {
    if (!isAdmin) return;
    if (!userInfo?.token) {
      toast.error('You must be logged in as admin.');
      return;
    }

    const idsToUpdate =
      selectedIds && selectedIds.length > 0 ? selectedIds : [baseMovieId];

    try {
      setSettingBanner(true);
      await setBannerMoviesService(userInfo.token, idsToUpdate, true);
      toast.success(
        `Added ${idsToUpdate.length} item${idsToUpdate.length > 1 ? 's' : ''} to Banner`
      );
      clearSelection();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to add to Banner';
      toast.error(msg);
    } finally {
      setSettingBanner(false);
    }
  };

  // Save navigation state to sessionStorage
  const saveNavigationState = useCallback(() => {
    const navigationState = {
      page: page || currentPage,
      category,
      year,
      times,
      rates,
      language,
      browseBy,
      scrollPosition: window.scrollY,
      timestamp: Date.now(),
      browseByParam,
      search: search || '',
    };
    try {
      sessionStorage.setItem(
        MOVIES_PAGE_STATE_KEY,
        JSON.stringify(navigationState)
      );
    } catch {}
  }, [
    page,
    currentPage,
    category,
    year,
    times,
    rates,
    language,
    browseBy,
    browseByParam,
    search,
  ]);

  // Build query parameters
  const queries = useMemo(() => buildQueries(), [buildQueries]);

  const getPageNumber = useCallback(() => {
    if (hasRestoredState.current && currentPage > 1) return currentPage;
    const pageFromUrl = searchParams.get('page');
    return pageFromUrl ? Number(pageFromUrl) : 1;
  }, [currentPage, searchParams]);

  // Fetch movies
  useEffect(() => {
    if (isError) toast.error(isError);

    if (!userInfo && Object.values(queries).some((val) => val)) {
      trackGuestAction('filter_usage', {
        filters: queries,
        page_location: '/movies',
      });
    }

    const pageNumber = getPageNumber();
    dispatch(getAllMoviesAction({ ...queries, pageNumber }));
  }, [dispatch, isError, queries, userInfo, getPageNumber]);

  // Restore scroll position after movies are loaded
  useEffect(() => {
    if (
      !isLoading &&
      displayMovies &&
      displayMovies.length > 0 &&
      scrollPositionRef.current > 0
    ) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
        scrollPositionRef.current = 0;
      });
    }
  }, [isLoading, displayMovies]);

  // Update URL with page number
  const updatePageInUrl = (pageNum) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', pageNum);
    setSearchParams(newSearchParams);
  };

  // Pagination handlers
  const nextPage = () => {
    const newPage = page + 1;
    setCurrentPage(newPage);
    updatePageInUrl(newPage);
    dispatch(getAllMoviesAction({ ...queries, pageNumber: newPage }));
    window.scrollTo(0, 0);
  };

  const prevPage = () => {
    const newPage = page - 1;
    setCurrentPage(newPage);
    updatePageInUrl(newPage);
    dispatch(getAllMoviesAction({ ...queries, pageNumber: newPage }));
    window.scrollTo(0, 0);
  };

  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
    updatePageInUrl(pageNum);
    dispatch(getAllMoviesAction({ ...queries, pageNumber: pageNum }));
    window.scrollTo(0, 0);
  };

  const datas = {
    categories,
    category,
    setCategory,
    language,
    setLanguage,
    rates,
    setRates,
    times,
    setTimes,
    year,
    setYear,
    browseBy,
    setBrowseBy,
  };

  // SEO helpers
  const generateSEOTitle = () => {
    let title = 'Watch Movies Online Free';
    if (search) title = `Search Results for "${search}"`;
    else if (browseByParam) title = `${browseByParam} Movies`;
    else if (category?.title && category.title !== 'All Categories')
      title = `${category.title} Movies`;

    title += ` - Page ${page} | MovieFrost`;
    return title;
  };

  const generateSEODescription = () => {
    let desc = 'Browse and watch thousands of movies online for free. ';
    if (search) desc = `Search results for "${search}". `;
    else if (browseByParam) desc = `Watch ${browseByParam} movies online. `;
    else if (category?.title && category.title !== 'All Categories')
      desc = `Stream ${category.title} movies. `;

    desc += 'Stream in HD quality for free.';
    return desc;
  };

  const handleMovieGridClick = () => {
    // Save state right before navigation (click on a movie card bubbles here)
    saveNavigationState();
  };

  return (
    <Layout>
      <MetaTags
        title={generateSEOTitle()}
        description={generateSEODescription()}
        keywords={`free movies, watch online movies, online streaming, ${
          category?.title || 'all'
        } movies, ${language?.title || 'all languages'}, ${
          year?.title || 'all years'
        }`}
        url={`https://www.moviefrost.com/movies${
          search ? `/${search}` : ''
        }${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
      />

      <div className="min-height-screen container mx-auto px-8 mobile:px-0 my-2">
        <Filters data={datas} />

        {/* ADMIN ORDERING BAR */}
        {isAdmin && (
          <div className="my-4 p-4 bg-dry rounded-lg border border-border">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setAdminMode((prev) => !prev);
                  setHasPendingReorder(false);
                  setDraggedId(null);
                  clearSelection();
                }}
                className={`px-4 py-2 text-sm rounded border transitions ${
                  adminMode
                    ? 'bg-customPurple border-customPurple text-white'
                    : 'border-customPurple text-white hover:bg-customPurple'
                }`}
              >
                {adminMode ? 'Exit Admin Mode' : 'Enter Admin Mode'}
              </button>

              {adminMode && (
                <>
                  <span className="text-xs text-dryGray">
                    Drag cards to reorder. Use dropdown to move to another page,
                    add to Latest New, or add to Banner.
                  </span>

                  {selectedIds.length > 0 && (
                    <span className="text-xs text-customPurple font-semibold">
                      {selectedIds.length} selected
                    </span>
                  )}

                  {selectedIds.length > 0 && (
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1.5 text-xs rounded border border-border text-white bg-main hover:bg-dry transitions"
                    >
                      Clear Selection
                    </button>
                  )}

                  {hasPendingReorder && (
                    <button
                      onClick={handleSaveOrder}
                      disabled={savingOrder}
                      className="px-4 py-2 text-sm rounded bg-green-600 hover:bg-green-700 text-white transitions disabled:opacity-50"
                    >
                      {savingOrder ? 'Saving...' : 'Save Order'}
                    </button>
                  )}

                  {hasPendingReorder && (
                    <button
                      onClick={() => {
                        if (Array.isArray(movies)) setLocalOrder([...movies]);
                        else setLocalOrder([]);
                        setHasPendingReorder(false);
                        setDraggedId(null);
                      }}
                      className="px-3 py-1.5 text-sm rounded border border-border text-white bg-main hover:bg-dry transitions"
                    >
                      Reset
                    </button>
                  )}

                  {(movingPage || settingLatestNew || settingBanner) && (
                    <span className="text-xs text-customPurple animate-pulse">
                      {movingPage
                        ? 'Moving...'
                        : settingLatestNew
                        ? 'Updating Latest New...'
                        : 'Updating Banner...'}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <p className="text-md font-medium my-4 mobile:px-4">
          Total{' '}
          <span className="font-bold text-customPurple">
            {displayMovies ? displayMovies.length : 0}
          </span>{' '}
          Items Found On This Page
        </p>

        {isLoading ? (
          <div className="w-full gap-6 flex-colo min-h-screen">
            <Loader />
          </div>
        ) : displayMovies?.length > 0 ? (
          <>
            <div
              className="grid sm:mt-8 mt-6 xl:grid-cols-5 above-1000:grid-cols-5 2xl:grid-cols-5 lg:grid-cols-3 sm:grid-cols-2 mobile:grid-cols-2 grid-cols-1 gap-4 mobile:gap-2 mobile:px-4"
              onClick={handleMovieGridClick}
            >
              {displayMovies.map((movieItem, index) => (
                <Movie
                  key={movieItem._id || index}
                  movie={movieItem}
                  showAdminControls={isAdmin && adminMode}
                  isSelected={selectedIds.includes(movieItem._id)}
                  onSelectToggle={toggleSelect}
                  totalPages={pages}
                  onMoveToPageClick={(movieId, targetPage) =>
                    handleMoveToPage(movieId, targetPage)
                  }
                  onMoveToLatestNewClick={(movieId) =>
                    handleAddToLatestNew(movieId)
                  }
                  onMoveToBannerClick={(movieId) => handleAddToBanner(movieId)}
                  adminDraggable={isAdmin && adminMode}
                  onAdminDragStart={handleDragStart}
                  onAdminDragEnter={handleDragEnter}
                  onAdminDragEnd={handleDragEnd}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="w-full flex-rows gap-3 md:my-14 my-10 mobile:px-4">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className={`${sameClass} px-2 py-2.5 text-sm ${
                  page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <TbPlayerTrackPrev className="text-md" />
              </button>

              <div className="flex gap-1.5">
                {[...Array(Math.min(5, pages))].map((_, index) => {
                  let pageNum;
                  if (pages <= 5) pageNum = index + 1;
                  else if (page <= 3) pageNum = index + 1;
                  else if (page >= pages - 2) pageNum = pages - 4 + index;
                  else pageNum = page - 2 + index;

                  return (
                    <button
                      key={index}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-2 text-sm rounded font-md transition-all ${
                        page === pageNum
                          ? 'bg-customPurple text-white'
                          : 'border-2 border-customPurple text-white hover:bg-customPurple'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={nextPage}
                disabled={page === pages}
                className={`${sameClass} px-2 py-2.5 text-sm ${
                  page === pages ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <TbPlayerTrackNext className="text-md" />
              </button>
            </div>

            {/* ✅ Ad under pagination */}
            <EffectiveGateNativeBanner />
          </>
        ) : (
          <div className="w-full gap-6 flex-colo min-h-screen">
            <div className="w-24 h-24 p-5 rounded-full mb-4 bg-dry text-customPurple text-4xl flex-colo">
              <RiMovie2Line />
            </div>
            <p className="text-border text-sm">
              It seems like we don't have any movies
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MoviesPage;
