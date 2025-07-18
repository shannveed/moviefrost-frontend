// MoviesServices.js
import Axios from "./Axios";

// ************ PUBLIC APIs ************

// get all movies
export const getAllMoviesService = async (
  category,
  time,
  language,
  rate,
  year,
  browseBy,
  search,
  pageNumber
) => {
  const { data } = await Axios.get(
    `/movies?category=${category}&time=${time}&language=${language}&rate=${rate}&year=${year}&browseBy=${browseBy}&search=${search}&pageNumber=${pageNumber}`
  );
  return data;
};

// get random movies
export const getRandomMoviesService = async () => {
  const { data } = await Axios.get('/movies/random/all');
  return data;
};

// get movie by id
export const getMovieByIdService = async (id) => {
  const { data } = await Axios.get(`/movies/${id}`);
  return data;
};

// get top rated movie
export const getTopRatedMovieService = async () => {
  const { data } = await Axios.get('/movies/rated/top');
  return data;
};

// get latest movies
export const getLatestMoviesService = async () => {
  const { data } = await Axios.get('/movies/latest');
  return data;
};

// review movie
export const reviewMovieService = async (token, id, review) => {
  const { data } = await Axios.post(`/movies/${id}/reviews`, review, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// delete movie
export const deleteMovieService = async (token, id) => {
  const { data } = await Axios.delete(`/movies/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// delete all movies
export const deleteAllMoviesService = async (token) => {
  const { data } = await Axios.delete(`/movies`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// create movie
export const createMovieService = async (token, movie) => {
  const { data } = await Axios.post(`/movies`, movie, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// update movie
export const updateMovieService = async (token, id, movie) => {
  const { data } = await Axios.put(`/movies/${id}`, movie, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// NEW: get distinct browseBy
export const getDistinctBrowseByService = async () => {
  const { data } = await Axios.get('/movies/browseBy-distinct');
  return data;
};

// ============ NEW ============
// Admin replies to a user's review
export const adminReplyReviewService = async (token, movieId, reviewId, reply) => {
  const { data } = await Axios.post(
    `/movies/${movieId}/reviews/${reviewId}/reply`,
    { reply },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};
