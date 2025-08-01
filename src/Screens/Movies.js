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
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
import MetaTags from '../Components/SEO/MetaTags';

function MoviesPage() {
  const { search } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const browseByParam = searchParams.get('browseBy') || '';
  
  const location = useLocation();
  const scrollPositionRef = useRef(0);

  const dispatch = useDispatch();
  const [category, setCategory] = useState({ title: 'All Categories' });
  const [year, setYear] = useState(YearData[0]);
  const [times, setTimes] = useState(TimesData[0]);
  const [rates, setRates] = useState(RatesData[0]);
  const [language, setLanguage] = useState(LanguageData[0]);
  const [browseBy, setBrowseBy] = useState(browseByData[0]);

  const sameClass =
    'text-white py-2 px-4 rounded font-semibold border-2 border-customPurple hover:bg-customPurple';

  const { isLoading, isError, movies, pages, page } = useSelector(
    (state) => state.getAllMovies
  );

  const { userInfo } = useSelector((state) => state.userLogin);
  const { categories } = useSelector((state) => state.categoryGetAll);

  const saveNavigationState = () => {
    const navigationState = {
      page: page,
      category: category,
      year: year,
      times: times,
      rates: rates,
      language: language,
      browseBy: browseBy,
      scrollPosition: window.scrollY,
      timestamp: Date.now()
    };
    sessionStorage.setItem('moviesPageState', JSON.stringify(navigationState));
  };

  useEffect(() => {
    const savedState = sessionStorage.getItem('moviesPageState');
    if (savedState && location.state?.fromMovieDetail) {
      const state = JSON.parse(savedState);
      if (Date.now() - state.timestamp < 30 * 60 * 1000) {
        setCategory(state.category);
        setYear(state.year);
        setTimes(state.times);
        setRates(state.rates);
        setLanguage(state.language);
        setBrowseBy(state.browseBy);
        scrollPositionRef.current = state.scrollPosition;
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const queries = useMemo(() => {
    const query = {
      category: category?.title === 'All Categories' ? '' : category?.title,
      time: times?.title.replace(/\D/g, ''),
      language: language?.title === 'Sort By Language' ? '' : language?.title,
      rate: rates?.title.replace(/\D/g, ''),
      year: year?.title.replace(/\D/g, ''),
      browseBy: browseByParam || (browseBy?.title === 'Browse By' ? '' : browseBy?.title),
      search: search ? search : '',
    };
    return query;
  }, [category, times, language, rates, year, browseBy, browseByParam, search]);

  const getPageNumber = useCallback(() => {
    if (location.state?.fromMovieDetail) {
      const savedState = sessionStorage.getItem('moviesPageState');
      if (savedState) {
        const state = JSON.parse(savedState);
        return state.page || 1;
      }
    }
    return searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  }, [location.state, searchParams]);

  useEffect(() => {
    if (isError) {
      toast.error(isError);
    }
    
    if (!userInfo && Object.values(queries).some(val => val)) {
      trackGuestAction('filter_usage', {
        filters: queries,
        page_location: '/movies'
      });
    }
    
    const pageNumber = getPageNumber();
    dispatch(getAllMoviesAction({ ...queries, pageNumber }));
  }, [dispatch, isError, queries, userInfo, getPageNumber]);;

  useEffect(() => {
    if (!isLoading && movies.length > 0 && scrollPositionRef.current > 0) {
      setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current);
        scrollPositionRef.current = 0;
      }, 100);
    }
  }, [isLoading, movies]);

  const updatePageInUrl = (pageNum) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', pageNum);
    setSearchParams(newSearchParams);
  };

  const nextPage = () => {
    const newPage = page + 1;
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
    updatePageInUrl(pageNum);
    dispatch(
      getAllMoviesAction({
        ...queries,
        pageNumber: pageNum,
      })
    );
    window.scrollTo(0, 0);
  };

  const datas = {
    categories: categories,
    category: category,
    setCategory: setCategory,
    language: language,
    setLanguage: setLanguage,
    rates: rates,
    setRates: setRates,
    times: times,
    setTimes: setTimes,
    year: year,
    setYear: setYear,
    browseBy: browseBy,
    setBrowseBy: setBrowseBy,
  };

  // Generate SEO title and description based on filters
  const generateSEOTitle = () => {
    let title = 'Watch Movies Online Free';
    if (search) title = `Search Results for "${search}"`;
    else if (browseByParam) title = `${browseByParam} Movies`;
    else if (category?.title && category.title !== 'All Categories') title = `${category.title} Movies`;
    
    title += ` - Page ${page} | MovieFrost`;
    return title;
  };

  const generateSEODescription = () => {
    let desc = 'Browse and watch thousands of movies online for free. ';
    if (search) desc = `Search results for "${search}". `;
    else if (browseByParam) desc = `Watch ${browseByParam} movies online. `;
    else if (category?.title && category.title !== 'All Categories') desc = `Stream ${category.title} movies. `;
    
    desc += 'Stream in HD quality for free.';
    return desc;
  };

  return (
    <Layout>
      <MetaTags 
        title={generateSEOTitle()}
        description={generateSEODescription()}
        keywords={`free movies, watch online movies, online streaming, ${category?.title || 'all'} movies, ${language?.title || 'all languages'}, ${year?.title || 'all years'}`}
        url={`https://moviefrost.com/movies${search ? `/${search}` : ''}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
      />
      
      <div className="min-height-screen container mx-auto px-8 mobile:px-0 my-2">
        <Filters data={datas} />
        {/* SEO H1 */}
        <h1 className="text-2xl font-bold mb-4 mobile:px-4 mobile:text-xl">
          Browse {browseByParam || category?.title || 'all'} movies {search && `matching "${search}"`}
        </h1>

        <p className="text-md font-medium my-4 mobile:px-4">
          Total{' '}
          <span className="font-bold text-customPurple">
            {movies ? movies?.length : 0}
          </span>{' '}
          Items Found On This Page {search && `for "${search}"`}
          {browseByParam && ` in "${browseByParam}"`}
        </p>
        <p className="text-md font-medium my-4 mobile:px-4">
          Total{' '}
          <span className="font-bold text-customPurple">
            {movies ? movies?.length : 0}
          </span>{' '}
          Items Found On This Page {search && `for "${search}"`}
          {browseByParam && ` in "${browseByParam}"`}
        </p>
        {isLoading ? (
          <div className="w-full gap-6 flex-colo min-h-screen">
            <Loader />
          </div>
        ) : movies?.length > 0 ? (
          <>
            <div 
              className="grid sm:mt-8 mt-6 xl:grid-cols-5 above-1000:grid-cols-5 2xl:grid-cols-5 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mobile:gap-0"
              onClick={saveNavigationState}
            >
              {movies.map((movie, index) => (
                <Movie key={index} movie={movie} />
              ))}
            </div>
            
            <div className="w-full flex-rows gap-3 md:my-14 my-10 mobile:px-4">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className={`${sameClass} px-2 py-2.5 text-sm`}
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
                className={`${sameClass} px-2 py-2.5 text-sm`}
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
