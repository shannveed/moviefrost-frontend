import React, { useEffect } from "react";
import SideBar from "./SideBar";
import Table from "../../Components/Table";
import { useDispatch, useSelector } from "react-redux";
import { deleteFavoriteMoviesAction, getFavoriteMoviesAction } from "../../Redux/Actions/userActions";
import toast from "react-hot-toast";
import Loader from "../../Components/Loader";
import { Empty } from "../../Components/Notifications/Empty";
import { DownloadVideo } from "../../Context/Functionalities";

function FavoritesMovies() {
  const dispatch = useDispatch();

  const { isLoading, isError, likedMovies } = useSelector(
    (state) => state.userGetFavoriteMovies
  );

  const { isLoading: deleteLoading, isError: deleteError, isSuccess } = useSelector(
    (state) => state.userDeleteFavoriteMovies
  );

  const deleteMoviesHandler = () => {
    window.confirm("Are you sure you want to delete all movies?") &&
      dispatch(deleteFavoriteMoviesAction());
  };

  const DownloadMovieVideo = (videoUrl) => {
    try {
      DownloadVideo(videoUrl);
    } catch (error) {
      toast.error('Download failed. Please try again later.');
    }
  };

  useEffect(() => {
    dispatch(getFavoriteMoviesAction());
    if (isError || deleteError) {
      toast.error(isError || deleteError);
      dispatch({
        type: isError
          ? "GET_FAVORITE_MOVIES_RESET"
          : "DELETE_FAVORITE_MOVIES_RESET",
      });
    }
  }, [dispatch, isError, deleteError, isSuccess]);

  return (
    <SideBar>
      <div className="flex flex-col gap-6 above-1000:gap-4 mobile:gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mobile:gap-2">
          <h2 className="text-xl font-bold above-1000:text-lg mobile:text-base">Favorites Movies</h2>
          {likedMovies?.length > 0 && (
            <button
              disabled={deleteLoading}
              onClick={deleteMoviesHandler}
              className="bg-main font-medium transitions hover:bg-customPurple border border-customPurple text-white 
                py-3 px-6 above-1000:py-2 above-1000:px-4 mobile:py-2 mobile:px-3 
                rounded text-base above-1000:text-sm mobile:text-xs w-full sm:w-auto"
            >
              {deleteLoading ? "Deleting..." : "Delete All"}
            </button>
          )}
        </div>

        {isLoading ? (
          <Loader />
        ) : likedMovies?.length > 0 ? (
          <div className="overflow-x-auto mobile:overflow-x-hidden">
            <Table
              data={likedMovies}
              admin={false}
              downloadVideo={DownloadMovieVideo}
            />
          </div>
        ) : (
          <Empty message="You have no favourites movies" />
        )}
      </div>
    </SideBar>
  );
}

export default FavoritesMovies;
