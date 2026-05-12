import { axiosAPI } from "../../services/api/client";
import { Category } from "../../types/category";

export const getQuizzes = async (categoryId?: number | string) => {
  let url = "/exams";
  if (categoryId && categoryId !== "All") {
    url += `?category_id=${categoryId}`;
  }
  const res = await axiosAPI.get(url);
  return res.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await axiosAPI.get('/categories');
  return response.data.data || response.data;
};

export const getQuizById = async (id: number) => {
  const res = await axiosAPI.get(`/exams/${id}`);
  return res.data;
};
