// Frontend/src/Redux/APIs/MoviesServices.js
import Axios from "./Axios";

// PUBLIC: get all movies (only published, backend enforces visibility)
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

// ADMIN: get all movies (includes drafts/unpublished)
export const getAllMoviesAdminService = async (
  token,
  {
    category = '',
    time = '',
    language = '',
    rate = '',
    year = '',
    browseBy = '',
    search = '',
    pageNumber = 1,
  } = {}
) => {
  const { data } = await Axios.get(
    `/movies/admin?category=${category}&time=${time}&language=${language}&rate=${rate}&year=${year}&browseBy=${browseBy}&search=${search}&pageNumber=${pageNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

// PUBLIC: get movie by id/slug (only published)
export const getMovieByIdService = async (id) => {
  const { data } = await Axios.get(`/movies/${id}`);
  return data;
};

// ADMIN: get movie by id/slug (includes drafts)
export const getMovieByIdAdminService = async (token, id) => {
  const { data } = await Axios.get(`/movies/admin/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// ✅ NEW: PUBLIC related movies by category (backend reads category from DB)
export const getRelatedMoviesService = async (idOrSlug, limit = 20) => {
  const safe = encodeURIComponent(String(idOrSlug || '').trim());
  const { data } = await Axios.get(`/movies/related/${safe}?limit=${limit}`);
  return data; // array
};

// ✅ NEW: ADMIN related movies by category (includes drafts)
export const getRelatedMoviesAdminService = async (token, idOrSlug, limit = 20) => {
  const safe = encodeURIComponent(String(idOrSlug || '').trim());
  const { data } = await Axios.get(`/movies/admin/related/${safe}?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data; // array
};

// PUBLIC: get random movies
export const getRandomMoviesService = async () => {
  const { data } = await Axios.get('/movies/random/all');
  return data;
};

// PUBLIC: get top rated
export const getTopRatedMovieService = async () => {
  const { data } = await Axios.get('/movies/rated/top');
  return data;
};

// PUBLIC: get latest
export const getLatestMoviesService = async () => {
  const { data } = await Axios.get('/movies/latest');
  return data;
};

// PRIVATE: review movie
export const reviewMovieService = async (token, id, review) => {
  const { data } = await Axios.post(`/movies/${id}/reviews`, review, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// ADMIN: delete movie
export const deleteMovieService = async (token, id) => {
  const { data } = await Axios.delete(`/movies/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// ADMIN: delete all movies
export const deleteAllMoviesService = async (token) => {
  const { data } = await Axios.delete(`/movies`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// ADMIN: create movie
export const createMovieService = async (token, movie) => {
  const { data } = await Axios.post(`/movies`, movie, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// ADMIN: update movie
export const updateMovieService = async (token, id, movie) => {
  const { data } = await Axios.put(`/movies/${id}`, movie, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// PUBLIC: get distinct browseBy
export const getDistinctBrowseByService = async () => {
  const { data } = await Axios.get('/movies/browseBy-distinct');
  return data;
};

// ADMIN: reply to user's review
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

// ADMIN ORDERING APIs
export const reorderMoviesInPageService = async (token, pageNumber, orderedIds) => {
  const { data } = await Axios.post(
    '/movies/admin/reorder-page',
    { pageNumber, orderedIds },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

export const moveMoviesToPageService = async (token, targetPage, movieIds) => {
  const { data } = await Axios.post(
    '/movies/admin/move-to-page',
    { targetPage, movieIds },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};
