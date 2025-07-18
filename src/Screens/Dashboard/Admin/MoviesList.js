import React, { useEffect, useState } from 'react';
import Table from '../../../Components/Table';
import SideBar from '../SideBar';
import { toast } from 'react-toastify';
import { deleteAllMoviesAction, deleteMovieAction, getAllMoviesAction } from '../../../Redux/Actions/MoviesActions';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../../Components/Loader';
import { Empty } from '../../../Components/Notifications/Empty';
import { TbPlayerTrackNext, TbPlayerTrackPrev } from 'react-icons/tb';
import { FaSearch } from 'react-icons/fa';

function MoviesList() {
  const dispatch = useDispatch();
  const sameClass = "text-white p-2 above-1000:p-1.5 rounded font-semibold border-2 border-customPurple hover:bg-customPurple text-sm above-1000:text-xs";

  /* ---------- NEW local search state ---------- */
  const [searchTerm, setSearchTerm] = useState('');

  const { isLoading, isError, movies, pages, page } = useSelector(
    (state) => state.getAllMovies
  );
  // delete
  const { isLoading: deleteLoading, isError: deleteError } = useSelector(
    (state) => state.deleteMovie
  );

  // delete all
  const { isLoading: allLoading, isError: allError } = useSelector(
    (state) => state.deleteAllMovies
  );

  // delete movie handler
  const deleteMovieHandler = (id) => {
    window.confirm("Are you sure you want to delete this movie?") &&
      dispatch(deleteMovieAction(id));
  };

  // delete all movies handler
  const deleteAllMoviesHandler = () => {
    window.confirm("Are you sure you want to delete all movies?") &&
    dispatch(deleteAllMoviesAction());
  };

  /* ---------- NEW search handler ---------- */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(
      getAllMoviesAction({
        search: searchTerm.trim(),
      }),
    );
  };

  // useEffect
  useEffect(() => {
    // errors
    if (isError || deleteError || allError) {
      toast.error(isError || deleteError || allError);
    }

    dispatch(getAllMoviesAction({}));
  }, [dispatch, isError, deleteError, allError]);

  // pagination next and prev pages
  const nextPage = () => {
    dispatch(
      getAllMoviesAction({
        pageNumber: page + 1,
      })
    );
  };

  const prevPage = () => {
    dispatch(
      getAllMoviesAction({
        pageNumber: page - 1,
      })
    );
  };

  return (
    <SideBar>
      <div className="flex flex-col gap-6 above-1000:gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 above-1000:gap-3 sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold above-1000:text-lg">Movies List</h2>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-main border-2 border-customPurple rounded above-1000:text-sm"
          >
            <button
              type="submit"
              className="bg-customPurple w-10 h-10 above-1000:w-8 above-1000:h-8 flex items-center justify-center text-white"
            >
              <FaSearch className="above-1000:text-xs" />
            </button>
            <input
              type="search"
              placeholder="Search movie…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent h-10 above-1000:h-8 px-3 above-1000:px-2 text-sm above-1000:text-xs placeholder:text-border outline-none text-white min-w-[150px] above-1000:min-w-[120px]"
            />
          </form>

          {movies?.length > 0 && (
            <button
              disabled={allLoading}
              onClick={deleteAllMoviesHandler}
              className="bg-main font-medium transition hover:bg-customPurple border border-customPurple text-white py-3 px-6 above-1000:py-2 above-1000:px-4 rounded text-sm above-1000:text-xs"
            >
              {allLoading ? 'Deleting…' : 'Delete All'}
            </button>
          )}
        </div>

        {/* Content */}
        {isLoading || deleteLoading ? (
          <Loader />
        ) : movies?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table
                data={movies}
                admin
                onDeleteHandler={deleteMovieHandler}
              />
            </div>
            
            {/* Pagination */}
            <div className="w-full flex-rows gap-4 above-1000:gap-3 my-5 above-1000:my-3">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className={sameClass}
              >
                <TbPlayerTrackPrev className="text-xl above-1000:text-base" />
              </button>
              
              {/* Page Numbers */}
              <div className="flex gap-2 above-1000:gap-1.5">
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
                      onClick={() => {
                        dispatch(
                          getAllMoviesAction({
                            pageNumber: pageNum,
                          })
                        );
                      }}
                      className={`px-3 py-2 above-1000:px-2 above-1000:py-1.5 rounded font-semibold transition-all text-sm above-1000:text-xs ${
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
                className={sameClass}
              >
                <TbPlayerTrackNext className="text-xl above-1000:text-base" />
              </button>
            </div>
          </>
        ) : (
          <Empty message="You have no movies" />
        )}
      </div>
    </SideBar>
  );
}

export default MoviesList;
