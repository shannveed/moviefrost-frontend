import Axios from "./Axios";

// Get all categories API function
const getCategoriesService = async () => {
  const { data } = await Axios.get("/categories");
  return data;
};

// Create new category API function
const createCategoryService = async (categoryData, token) => {
  const { data } = await Axios.post("/categories", categoryData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// Delete category API function
const deleteCategoryService = async (id, token) => {
  const { data } = await Axios.delete(`/categories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// Update category API function
const updateCategoryService = async (id, categoryData, token) => {
  const { data } = await Axios.put(`/categories/${id}`, categoryData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export {
  getCategoriesService,
  createCategoryService,
  deleteCategoryService,
  updateCategoryService,
};
