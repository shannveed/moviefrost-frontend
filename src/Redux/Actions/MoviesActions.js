// Frontend/src/Redux/Actions/MoviesActions.js
import * as moviesConstants from "../Constants/MoviesConstants";
import * as moviesAPIs from "../APIs/MoviesServices";
import { ErrorsAction, tokenProtection } from "../Protection";
import toast from "react-hot-toast";
import { addNotification } from "./notificationsActions";
import { getLatestMoviesService } from "../APIs/MoviesServices";

// get all movies
export const getAllMoviesAction =
  ({
    category = '',
    time = '',
    language = '',
    rate = '',
    year = '',
    browseBy = '',
    search = '',
    pageNumber = '',
  }) =>
  async (dispatch) => {
    try {
      const normalizedPageNumber =
        pageNumber && Number(pageNumber) > 0 ? Number(pageNumber) : 1;

      const queryKey = JSON.stringify({
        category,
        time,
        language,
        rate,
        year,
        browseBy,
        search,
        pageNumber: normalizedPageNumber,
      });

      dispatch({
        type: moviesConstants.MOVIES_LIST_REQUEST,
        payload: { queryKey },
      });

      const response = await moviesAPIs.getAllMoviesService(
        category,
        time,
        language,
        rate,
        year,
        browseBy,
        search,
        normalizedPageNumber
      );

      dispatch({
        type: moviesConstants.MOVIES_LIST_SUCCESS,
        payload: {
          ...response,
          queryKey,
        },
      });
    } catch (error) {
      ErrorsAction(error, dispatch, moviesConstants.MOVIES_LIST_FAIL);
    }
  };

// get random movies
export const getRandomMoviesAction = () => async (dispatch) => {
  try {
    dispatch({ type: moviesConstants.MOVIES_RANDOM_REQUEST });
    const response = await moviesAPIs.getRandomMoviesService();
    dispatch({
      type: moviesConstants.MOVIES_RANDOM_SUCCESS,
      payload: response,
    });
  } catch (error) {
    ErrorsAction(error, dispatch, moviesConstants.MOVIES_RANDOM_FAIL);
  }
};

// get movie by id (now accepts slug or id)
export const getMovieByIdAction = (idOrSlug) => async (dispatch) => {
  try {
    dispatch({ type: moviesConstants.MOVIE_DETAILS_REQUEST });
    const response = await moviesAPIs.getMovieByIdService(idOrSlug);
    dispatch({
      type: moviesConstants.MOVIE_DETAILS_SUCCESS,
      payload: response,
    });
  } catch (error) {
    ErrorsAction(error, dispatch, moviesConstants.MOVIE_DETAILS_FAIL);
  }
};

// get top rated
export const getTopRatedMovieAction = () => async (dispatch) => {
  try {
    dispatch({ type: moviesConstants.MOVIE_TOP_RATED_REQUEST });
    const response = await moviesAPIs.getTopRatedMovieService();
    dispatch({
      type: moviesConstants.MOVIE_TOP_RATED_SUCCESS,
      payload: response,
    });
  } catch (error) {
    ErrorsAction(error, dispatch, moviesConstants.MOVIE_TOP_RATED_FAIL);
  }
};

// review movie
export const reviewMovieAction =
  ({ id, review }) =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: moviesConstants.CREATE_REVIEW_REQUEST });
      const response = await moviesAPIs.reviewMovieService(
        tokenProtection(getState),
        id,
        review
      );
      dispatch({
        type: moviesConstants.CREATE_REVIEW_SUCCESS,
      });
      toast.success("Review added successfully");
      dispatch({ type: moviesConstants.CREATE_REVIEW_RESET });
      dispatch(getMovieByIdAction(id));

      const {
        userLogin: { userInfo },
      } = getState();

      if (userInfo && userInfo.token && response.review) {
        // Use movieSlug for notification link
        const moviePathSegment = response.review.movieSlug || id;
        dispatch(
          addNotification({
            message: `User "${userInfo.fullName}" reviewed "${response.review.comment.substring(0, 30)}..." on movie ${response.review.movieName || ''}`.trim(),
            forAdmin: true,
            link: response.review._id 
              ? `/movie/${moviePathSegment}#review-${response.review._id}` 
              : `/movie/${moviePathSegment}`,
          })
        );
      }
    } catch (error) {
      ErrorsAction(error, dispatch, moviesConstants.CREATE_REVIEW_FAIL);
    }
  };

// delete movie
export const deleteMovieAction = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: moviesConstants.DELETE_MOVIE_REQUEST });
    await moviesAPIs.deleteMovieService(tokenProtection(getState), id);
    dispatch({
      type: moviesConstants.DELETE_MOVIE_SUCCESS,
    });
    toast.success("Movie deleted successfully");
    dispatch(getAllMoviesAction({}));
  } catch (error) {
    ErrorsAction(error, dispatch, moviesConstants.DELETE_MOVIE_FAIL);
  }
};

// delete all movies
export const deleteAllMoviesAction = () => async (dispatch, getState) => {
  try {
    dispatch({ type: moviesConstants.DELETE_ALL_MOVIES_REQUEST });
    await moviesAPIs.deleteAllMoviesService(tokenProtection(getState));
    dispatch({
      type: moviesConstants.DELETE_ALL_MOVIES_SUCCESS,
    });
    toast.success("All movies deleted successfully");
    dispatch(getAllMoviesAction({}));
  } catch (error) {
    ErrorsAction(error, dispatch, moviesConstants.DELETE_ALL_MOVIES_FAIL);
  }
};

// create movie
export const createMovieAction = (movie) => async (dispatch, getState) => {
  try {
    dispatch({ type: moviesConstants.CREATE_MOVIE_REQUEST });
    await moviesAPIs.createMovieService(tokenProtection(getState), movie);
    dispatch({
      type: moviesConstants.CREATE_MOVIE_SUCCESS,
    });
    toast.success("Movie created successfully");
    dispatch(getAllMoviesAction({}));
  } catch (error) {
    ErrorsAction(error, dispatch, moviesConstants.CREATE_MOVIE_FAIL);
  }
};

// update movie
export const updateMovieAction = (id, movie) => async (dispatch, getState) => {
  try {
    dispatch({ type: moviesConstants.UPDATE_MOVIE_REQUEST });
    await moviesAPIs.updateMovieService(tokenProtection(getState), id, movie);
    dispatch({
      type: moviesConstants.UPDATE_MOVIE_SUCCESS,
    });
    toast.success("Movie updated successfully");
    dispatch(getMovieByIdAction(id));
  } catch (error) {
    ErrorsAction(error, dispatch, moviesConstants.UPDATE_MOVIE_FAIL);
  }
};

// get distinct "browseBy" values
export const getDistinctBrowseByAction = () => async (dispatch) => {
  try {
    dispatch({ type: moviesConstants.MOVIE_BROWSEBY_REQUEST });
    const data = await moviesAPIs.getDistinctBrowseByService();
    dispatch({ type: moviesConstants.MOVIE_BROWSEBY_SUCCESS, payload: data });
  } catch (error) {
    ErrorsAction(error, dispatch, moviesConstants.MOVIE_BROWSEBY_FAIL);
  }
};

// Admin replying to a user review
export const adminReplyReviewAction = (movieId, reviewId, reply) => async (dispatch, getState) => {
  try {
    dispatch({ type: moviesConstants.ADMIN_REPLY_REVIEW_REQUEST });
    const token = tokenProtection(getState);
    const response = await moviesAPIs.adminReplyReviewService(token, movieId, reviewId, reply);

    dispatch({
      type: moviesConstants.ADMIN_REPLY_REVIEW_SUCCESS,
      payload: response,
    });
    toast.success("Admin replied successfully");
    dispatch(getMovieByIdAction(movieId));

    if (response.review) {
      // Use movieSlug for notification link
      const moviePathSegment = response.review.movieSlug || movieId;
      dispatch(
        addNotification({
          message: `Admin replied to your review: "${response.review.adminReply.substring(0, 30)}..."`,
          forAdmin: false,
          link: `/movie/${moviePathSegment}#review-${reviewId}`,
        })
      );
    }

  } catch (error) {
    ErrorsAction(error, dispatch, moviesConstants.ADMIN_REPLY_REVIEW_FAIL);
  }
};

// latest 15 movies
export const getLatestMoviesAction = () => async (dispatch) => {
  try {
    dispatch({ type: moviesConstants.MOVIES_LATEST_REQUEST });
    const response = await getLatestMoviesService();
    dispatch({
      type: moviesConstants.MOVIES_LATEST_SUCCESS,
      payload: response,
    });
  } catch (error) {
    ErrorsAction(error, dispatch, moviesConstants.MOVIES_LATEST_FAIL);
  }
};
