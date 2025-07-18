// store.js
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import * as User from "./Reducers/userReducers";
import * as categories from "./Reducers/CategoriesReducers";
import {
  createMovieReducer,
  createReviewReducer,
  deleteAllMoviesReducer,
  deleteMovieReducer,
  movieDetailsReducer,
  moviesListReducer,
  moviesRandomReducer,
  movieTopRatedReducer,
  updateMovieReducer,
  browseByDistinctReducer,
  adminReplyReviewReducer,
  moviesLatestReducer, // Added this import
} from "./Reducers/MoviesReducers";

// NEW
import { notificationsReducer } from "./Reducers/notificationsReducers";

const rootReducer = combineReducers({
  // user reducers
  userLogin: User.userLoginReducer,
  userRegister: User.userRegisterReducer,
  userUpdateProfile: User.userUpdateProfileReducer,
  userDeleteProfile: User.userDeleteProfileReducer,
  userChangePassword: User.userChangePasswordReducer,
  userGetFavoriteMovies: User.userGetFavoriteMoviesReducer,
  userDeleteFavoriteMovies: User.userDeleteFavoriteMoviesReducer,
  adminGetAllUsers: User.adminGetAllUsersReducer,
  adminDeleteUser: User.adminDeleteUserReducer,
  userLikeMovie: User.userLikeMovieReducer,

  // category
  categoryGetAll: categories.getAllCategoriesReducer,
  categoryCreate: categories.createCategoryReducer,
  categoryUpdate: categories.updateCategoryReducer,
  categoryDelete: categories.deleteCategoryReducer,

  // movies
  getAllMovies: moviesListReducer,
  getRandomMovies: moviesRandomReducer,
  getMovieById: movieDetailsReducer,
  getTopRatedMovie: movieTopRatedReducer,
  createReview: createReviewReducer,
  deleteMovie: deleteMovieReducer,
  deleteAllMovies: deleteAllMoviesReducer,
  createMovie: createMovieReducer,
  updateMovie: updateMovieReducer,
  browseByDistinct: browseByDistinctReducer,
  adminReplyReview: adminReplyReviewReducer,
  moviesLatest: moviesLatestReducer,   // <-- add here

  // notifications
  notifications: notificationsReducer,
});

const userInfoFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const initialState = {
  userLogin: { userInfo: userInfoFromStorage },
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
});
