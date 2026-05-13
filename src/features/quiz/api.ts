import { axiosAPI } from "../../services/api/client";
import { Category } from "../../types/category";
import { Quiz } from "../../types/quiz";
import { QuizDetail, QuizResultPayload } from "./types";

const categoryNameBySlug: Record<string, string> = {
  programming: "Lập trình",
  languages: "Ngoại ngữ",
  science: "Khoa học",
  mathematics: "Toán học",
  database: "Cơ sở dữ liệu",
  history: "Lịch sử",
};

const normalizeCategory = (category?: Category | null): Category | undefined => {
  if (!category) {
    return undefined;
  }

  const normalizedName = category.slug ? categoryNameBySlug[category.slug] : undefined;

  return {
    ...category,
    name: normalizedName || category.name,
  };
};

const unwrapData = <T>(data: T | { data?: T } | { exam?: T }): T => {
  if (data && typeof data === "object") {
    if ("data" in data && data.data) {
      return data.data;
    }

    if ("exam" in data && data.exam) {
      return data.exam;
    }
  }

  return data as T;
};

export const getQuizzes = async (categoryId?: number | string): Promise<Quiz[]> => {
  let url = "/exams";
  if (categoryId && categoryId !== "All") {
    url += `?category_id=${categoryId}`;
  }
  const res = await axiosAPI.get(url);
  const quizzes = unwrapData<Quiz[]>(res.data);

  return quizzes.map((quiz) => ({
    ...quiz,
    category: normalizeCategory(quiz.category) || quiz.category,
    questions: quiz.questions_count ?? quiz.questions ?? 0,
  }));
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await axiosAPI.get('/categories');
  const categories = unwrapData<Category[]>(response.data);
  return categories.map((category) => normalizeCategory(category) || category);
};

export const getQuizById = async (id: number): Promise<QuizDetail> => {
  const res = await axiosAPI.get(`/exams/${id}`);
  const quiz = unwrapData<QuizDetail>(res.data);

  return {
    ...quiz,
    category:
      typeof quiz.category === "object"
        ? normalizeCategory(quiz.category)
        : quiz.category,
  };
};

export const submitQuizResult = async (payload: QuizResultPayload) => {
  const res = await axiosAPI.post("/results", payload);
  return res.data?.data || res.data;
};
