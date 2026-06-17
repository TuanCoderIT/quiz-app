import type { DocumentPickerAsset } from "expo-document-picker";

export type QuizDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface AIQuizFromPromptPayload {
  prompt: string;
  number_of_questions?: number;
  title: string;
  description?: string;
  category_id: number;
  difficulty: QuizDifficulty;
  duration: number;
  color?: string;
  passing_score: number;
  max_attempts: number;
}

export interface AIQuizQuestion {
  id: number;
  content: string;
  options: Record<string, string>;
  answer: string;
  explanation: string | null;
  type: "multiple_choice" | "true_false";
  points: number;
}

export interface AIQuizDetail {
  id: number;
  title: string;
  description: string;
  category_id: number;
  difficulty: string;
  duration: number;
  passing_score: number;
  max_attempts: number;
  is_ai_generated: boolean;
  questions: AIQuizQuestion[];
}

export interface QuizGenerationResponse {
  message: string;
  data: AIQuizDetail;
}

export interface AIQuizFormState {
  title: string;
  description: string;
  category_id: number | null;
  difficulty: QuizDifficulty;
  duration: string;
  passing_score: string;
  max_attempts: string;
  mode: "prompt" | "file";
  prompt: string;
  file: DocumentPickerAsset | null;
  number_of_questions: number;
}

export interface AIQuizFormErrors {
  title?: string;
  description?: string;
  category_id?: string;
  difficulty?: string;
  duration?: string;
  passing_score?: string;
  max_attempts?: string;
  prompt?: string;
  file?: string;
  number_of_questions?: string;
  general?: string;
}
