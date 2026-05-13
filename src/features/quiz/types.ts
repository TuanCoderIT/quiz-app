import { Category } from "../../types/category";

export type QuizQuestionType =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "essay"
  | string;

export interface QuizQuestion {
  id: number;
  content: string;
  type?: QuizQuestionType;
  options?: Record<string, string> | string[];
  answer?: string | number;
  explanation?: string;
  points?: number;
  pivot?: {
    exam_id: number;
    question_id: number;
    order?: number;
  };
}

export interface QuizDetail {
  id: number;
  title: string;
  description?: string;
  category_id?: number;
  category?: Category | string;
  difficulty?: string;
  duration?: number;
  color?: string;
  passing_score?: number;
  max_attempts?: number;
  questions: QuizQuestion[];
}

export interface QuizAnswerSubmission {
  question_id: number;
  type: QuizQuestionType;
  answer: string;
}

export interface QuizResultPayload {
  exam_id: number;
  time_spent: number;
  completed_at: string;
  score?: number;
  total?: number;
  percentage?: number;
}
