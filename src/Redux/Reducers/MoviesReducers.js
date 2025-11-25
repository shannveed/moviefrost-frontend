// Frontend/src/Redux/Reducers/MoviesReducers.js
import * as moviesConstants from "../Constants/MoviesConstants";

// --- GET ALL MOVIES ---

const initialMoviesListState = {
  movies: [],
  pages: 0,
  page: 1,
  totalMovies: 0,
  isLoading: false,
  isError: null,
  // Track which query this list belongs to
  currentQueryKey: null,
};

export const moviesListReducer = (state = initialMoviesListState, action) => {
  switch (action.type) {
    case moviesConstants.MOVIES_LIST_REQUEST: {
      const nextQueryKey = action.payload?.queryKey || null;

      // Same query again (e.g. coming back to Movies page) →
      // keep current movies visible while we refetch.
      if (nextQueryKey && nextQueryKey === state.currentQueryKey) {
        return {
          ...state,
          isLoading: true,
          isError: null,
        };
      }

      // New query or first load → clear list
      return {
        ...initialMoviesListState,
        isLoading: true,
        currentQueryKey: nextQueryKey,
      };
    }

    case moviesConstants.MOVIES_LIST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isError: null,
        movies: action.payload.movies,
        pages: action.payload.pages,
        page: action.payload.page,
        totalMovies: action.payload.totalMovies,
        currentQueryKey: action.payload.queryKey || state.currentQueryKey,
      };

    case moviesConstants.MOVIES_LIST_FAIL:
      return {
        ...state,
        isLoading: false,
        isError: action.payload,
      };

    default:
      return state;
  }
};

// --- GET RANDOM MOVIES ---

export const moviesRandomReducer = (
  state = { movies: [], isLoading: false },
  action
) => {
  switch (action.type) {
    case moviesConstants.MOVIES_RANDOM_REQUEST:
      // Keep existing list while reloading
      return { ...state, isLoading: true };
    case moviesConstants.MOVIES_RANDOM_SUCCESS:
      return { isLoading: false, movies: action.payload };
    case moviesConstants.MOVIES_RANDOM_FAIL:
      return { ...state, isLoading: false, isError: action.payload };
    default:
      return state;
  }
};

// --- MOVIE DETAILS ---

export const movieDetailsReducer = (state = { movie: {} }, action) => {
  switch (action.type) {
    case moviesConstants.MOVIE_DETAILS_REQUEST:
      return { isLoading: true };
    case moviesConstants.MOVIE_DETAILS_SUCCESS:
      return { isLoading: false, movie: action.payload };
    case moviesConstants.MOVIE_DETAILS_FAIL:
      return { isLoading: false, isError: action.payload };
    case moviesConstants.MOVIE_DETAILS_RESET:
      return { movie: {} };
    default:
      return state;
  }
};

// --- TOP RATED MOVIES ---

export const movieTopRatedReducer = (
  state = { movies: [], isLoading: false },
  action
) => {
  switch (action.type) {
    case moviesConstants.MOVIE_TOP_RATED_REQUEST:
      return { ...state, isLoading: true };
    case moviesConstants.MOVIE_TOP_RATED_SUCCESS:
      return { isLoading: false, movies: action.payload };
    case moviesConstants.MOVIE_TOP_RATED_FAIL:
      return { ...state, isLoading: false, isError: action.payload };
    default:
      return state;
  }
};

// --- CREATE REVIEW ---

export const createReviewReducer = (state = {}, action) => {
  switch (action.type) {
    case moviesConstants.CREATE_REVIEW_REQUEST:
      return { isLoading: true };
    case moviesConstants.CREATE_REVIEW_SUCCESS:
      return { isLoading: false, isSuccess: true };
    case moviesConstants.CREATE_REVIEW_FAIL:
      return { isLoading: false, isError: action.payload };
    case moviesConstants.CREATE_REVIEW_RESET:
      return {};
    default:
      return state;
  }
};

// --- DELETE MOVIE ---

export const deleteMovieReducer = (state = {}, action) => {
  switch (action.type) {
    case moviesConstants.DELETE_MOVIE_REQUEST:
      return { isLoading: true };
    case moviesConstants.DELETE_MOVIE_SUCCESS:
      return { isLoading: false, isSuccess: true };
    case moviesConstants.DELETE_MOVIE_FAIL:
      return { isLoading: false, isError: action.payload };
    default:
      return state;
  }
};

// --- DELETE ALL MOVIES ---

export const deleteAllMoviesReducer = (state = {}, action) => {
  switch (action.type) {
    case moviesConstants.DELETE_ALL_MOVIES_REQUEST:
      return { isLoading: true };
    case moviesConstants.DELETE_ALL_MOVIES_SUCCESS:
      return { isLoading: false, isSuccess: true };
    case moviesConstants.DELETE_ALL_MOVIES_FAIL:
      return { isLoading: false, isError: action.payload };
    default:
      return state;
  }
};

// --- CREATE MOVIE ---

export const createMovieReducer = (state = {}, action) => {
  switch (action.type) {
    case moviesConstants.CREATE_MOVIE_REQUEST:
      return { isLoading: true };
    case moviesConstants.CREATE_MOVIE_SUCCESS:
      return { isLoading: false, isSuccess: true };
    case moviesConstants.CREATE_MOVIE_FAIL:
      return { isLoading: false, isError: action.payload };
    case moviesConstants.CREATE_MOVIE_RESET:
      return {};
    default:
      return state;
  }
};

// --- UPDATE MOVIE ---

export const updateMovieReducer = (state = {}, action) => {
  switch (action.type) {
    case moviesConstants.UPDATE_MOVIE_REQUEST:
      return { isLoading: true };
    case moviesConstants.UPDATE_MOVIE_SUCCESS:
      return { isLoading: false, isSuccess: true };
    case moviesConstants.UPDATE_MOVIE_FAIL:
      return { isLoading: false, isError: action.payload };
    case moviesConstants.UPDATE_MOVIE_RESET:
      return {};
    default:
      return state;
  }
};

// --- DISTINCT browseBy ---

export const browseByDistinctReducer = (state = { browseBy: [] }, action) => {
  switch (action.type) {
    case moviesConstants.MOVIE_BROWSEBY_REQUEST:
      return { isLoading: true, browseBy: [] };
    case moviesConstants.MOVIE_BROWSEBY_SUCCESS:
      return { isLoading: false, browseBy: action.payload };
    case moviesConstants.MOVIE_BROWSEBY_FAIL:
      return { isLoading: false, isError: action.payload };
    default:
      return state;
  }
};

// --- ADMIN REPLY REVIEW ---

export const adminReplyReviewReducer = (state = {}, action) => {
  switch (action.type) {
    case moviesConstants.ADMIN_REPLY_REVIEW_REQUEST:
      return { isLoading: true };
    case moviesConstants.ADMIN_REPLY_REVIEW_SUCCESS:
      return { isLoading: false, isSuccess: true, replyData: action.payload };
    case moviesConstants.ADMIN_REPLY_REVIEW_FAIL:
      return { isLoading: false, isError: action.payload };
    case moviesConstants.ADMIN_REPLY_REVIEW_RESET:
      return {};
    default:
      return state;
  }
};

// --- LATEST MOVIES ---

export const moviesLatestReducer = (
  state = { movies: [], isLoading: false },
  action
) => {
  switch (action.type) {
    case moviesConstants.MOVIES_LATEST_REQUEST:
      return { ...state, isLoading: true };
    case moviesConstants.MOVIES_LATEST_SUCCESS:
      return { isLoading: false, movies: action.payload };
    case moviesConstants.MOVIES_LATEST_FAIL:
      return { ...state, isLoading: false, isError: action.payload };
    default:
      return state;
  }
};
