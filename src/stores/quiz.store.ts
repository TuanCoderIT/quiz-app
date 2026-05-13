// src/stores/quiz.store.ts
import { create } from "zustand";
import { Quiz } from "../types/quiz";
import { Category } from "../types/category";
import { getQuizzes, getCategories } from "../features/quiz/api";

interface QuizState {
  exams: Quiz[];
  categories: Category[];
  isLoading: boolean;
  fetchQuizzes: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  setExams: (exams: Quiz[]) => void;
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  exams: [],
  categories: [],
  isLoading: false,

  fetchQuizzes: async () => {
    set({ isLoading: true });
    try {
      const exams = await getQuizzes();
      // console.log("Dữ liệu Quiz từ API:", exams);
      set({ exams });
    } catch (error) {
      console.error("Lỗi lấy danh sách bài quiz:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await getCategories();
      // console.log("Dữ liệu Categories từ API:", categories);
      // Thêm option "Tất cả" vào danh sách categories nếu cần
      set({ categories: [{ id: 'all', name: 'Tất cả' }, ...categories] });
    } catch (error) {
      console.error("Lỗi lấy danh sách danh mục:", error);
    }
  },

  setExams: (exams) => set({ exams }),
  setCategories: (categories) => set({ categories }),
  setLoading: (isLoading) => set({ isLoading }),
}));
