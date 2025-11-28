// src/Screens/Movies.js
import { trackGuestAction } from '../utils/analytics';
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
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
import {
  useParams,
  useSearchParams,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import MetaTags from '../Components/SEO/MetaTags';

// Session storage key for movies page state
const MOVIES_PAGE_STATE_KEY = 'moviesPageState';

function MoviesPage() {
  const { search } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const browseByParam = searchParams.get('browseBy') || '';
  const navigationType = useNavigationType();

  const location = useLocation();
  const dispatch = useDispatch();

  // Track if we've restored state
  const hasRestoredState = useRef(false);
  const scrollPositionRef = useRef(0);

  // Filter states with default values
  const [category, setCategory] = useState({ title: 'All Categories' });
  const [year, setYear] = useState(YearData[0]);
  const [times, setTimes] = useState(TimesData[0]);
  const [rates, setRates] = useState(RatesData[0]);
  const [language, setLanguage] = useState(LanguageData[0]);
  const [browseBy, setBrowseBy] = useState(browseByData[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const sameClass =
    'text-white py-2 px-4 rounded font-semibold border-2 border-customPurple hover:bg-customPurple';

  const { isLoading, isError, movies, pages, page } = useSelector(
    (state) => state.getAllMovies
  );

  const { userInfo } = useSelector((state) => state.userLogin);
  const { categories } = useSelector((state) => state.categoryGetAll);

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
    } catch {
      // ignore quota errors
    }
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

  // Restore state when navigating back
  useEffect(() => {
    if (hasRestoredState.current) return;

    let savedStateRaw = null;
    try {
      savedStateRaw = sessionStorage.getItem(MOVIES_PAGE_STATE_KEY);
    } catch {
      savedStateRaw = null;
    }

    // Restore on browser back (POP) or when coming from movie detail
    if (
      savedStateRaw &&
      (navigationType === 'POP' || location.state?.fromMovieDetail)
    ) {
      try {
        const state = JSON.parse(savedStateRaw);
        // Only restore if the state is fresh (less than 30 minutes old)
        if (Date.now() - state.timestamp < 30 * 60 * 1000) {
          setCategory(state.category || { title: 'All Categories' });
          setYear(state.year || YearData[0]);
          setTimes(state.times || TimesData[0]);
          setRates(state.rates || RatesData[0]);
          setLanguage(state.language || LanguageData[0]);
          setBrowseBy(state.browseBy || browseByData[0]);
          setCurrentPage(state.page || 1);
          scrollPositionRef.current = state.scrollPosition || 0;
          hasRestoredState.current = true;
        }
      } catch (e) {
        console.error('Error restoring movies page state:', e);
      }
      // Clean the location state
      window.history.replaceState({}, document.title);
    }
  }, [navigationType, location.state]);

  // Build query parameters
  const queries = useMemo(() => {
    const query = {
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
    return query;
  }, [
    category,
    times,
    language,
    rates,
    year,
    browseBy,
    browseByParam,
    search,
  ]);

  // Get the page number (from restored state or URL)
  const getPageNumber = useCallback(() => {
    if (hasRestoredState.current && currentPage > 1) {
      return currentPage;
    }
    const pageFromUrl = searchParams.get('page');
    return pageFromUrl ? Number(pageFromUrl) : 1;
  }, [currentPage, searchParams]);

  // Fetch movies
  useEffect(() => {
    if (isError) {
      toast.error(isError);
    }

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
      movies &&
      movies.length > 0 &&
      scrollPositionRef.current > 0
    ) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
        scrollPositionRef.current = 0;
      });
    }
  }, [isLoading, movies]);

  // Update URL with page number
  const updatePageInUrl = (pageNum) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', pageNum);
    setSearchParams(newSearchParams);
  };

  // Navigation handlers
  const nextPage = () => {
    const newPage = page + 1;
    setCurrentPage(newPage);
    updatePageInUrl(newPage);
    dispatch(
      getAllMoviesAction({
        ...queries,
        pageNumber: newPage,
      })
    );
    window.scrollTo(0, 0);
  };

  const prevPage = () => {
    const newPage = page - 1;
    setCurrentPage(newPage);
    updatePageInUrl(newPage);
    dispatch(
      getAllMoviesAction({
        ...queries,
        pageNumber: newPage,
      })
    );
    window.scrollTo(0, 0);
  };

  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
    updatePageInUrl(pageNum);
    dispatch(
      getAllMoviesAction({
        ...queries,
        pageNumber: pageNum,
      })
    );
    window.scrollTo(0, 0);
  };

  // Filter data for the Filters component
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

  // Handle movie card click - save state before navigation
  const handleMovieClick = () => {
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
        url={`https://moviefrost.com/movies${
          search ? `/${search}` : ''
        }${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
      />

      <div className="min-height-screen container mx-auto px-8 mobile:px-0 my-2">
        <Filters data={datas} />
        {/* Q1: simplified header text */}
        <p className="text-md font-medium my-4 mobile:px-4">
          Total{' '}
          <span className="font-bold text-customPurple">
            {movies ? movies.length : 0}
          </span>{' '}
          Items Found On This Page
        </p>
        {isLoading ? (
          <div className="w-full gap-6 flex-colo min-h-screen">
            <Loader />
          </div>
        ) : movies?.length > 0 ? (
          <>
            <div
              className="grid sm:mt-8 mt-6 xl:grid-cols-5 above-1000:grid-cols-5 2xl:grid-cols-5 lg:grid-cols-3 sm:grid-cols-2 mobile:grid-cols-2 grid-cols-1 gap-4 mobile:gap-2 mobile:px-4"
              onClick={handleMovieClick}
            >
              {movies.map((movie, index) => (
                <Movie key={movie._id || index} movie={movie} />
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
                  if (pages <= 5) {
                    pageNum = index + 1;
                  } else if (page <= 3) {
                    pageNum = index + 1;
                  } else if (page >= pages - 2) {
                    pageNum = pages - 4 + index;
                  } else {
                    pageNum = page - 2 + index;
                  }

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
