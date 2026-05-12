// src/types/quiz.ts
import { Category } from "./category";
import { Question } from "./question";

export interface Quiz {
  id: number;
  title: string;
  description: string;
  category: Category;
  difficulty: string;
  duration: number;
  questions: number;
  questions_count?: number;
  progress: number;
  color: string;
}

export interface QuizInfo {
  id: number;
  title: string;
  description: string;
  category: string;
  learning_objectives: string[];
  prerequisites: string[];
  tags: string[];
  questions_count: number;
  duration: number;
  difficulty: string;
  passing_score: number;
  attempts: number;
  max_attempts: number;
  estimated_time: string;
  price_token: number;
  is_purchased: boolean;
}

export interface QuizHistoryItem {
  id: number;
  user_id: number;
  exam_id: number;
  score: number;
  total: number;
  percentage: number;
  time_spent: number;
  completed_at: string;
  exam: {
    id: number;
    title: string;
    category: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
  };
}

// AI Quiz Generation Types
export interface TextPromptRequest {
  prompt: string;
  number_of_questions?: number;
}

export interface FileUploadRequest {
  file: File;
  number_of_questions?: number;
}

export interface AIQuizResponse {
  id: number;
  title: string;
  description: string;
  category_id: number;
  difficulty: string;
  duration: number;
  status: 'draft';
  is_ai_generated: true;
  questions: Question[];
}

export interface AIQuizFormData {
  mode: 'text' | 'file';
  prompt?: string;
  file?: File;
  numberOfQuestions: number;
}

// User Quiz Submission Types
export interface UserQuizSubmission {
  id: number;
  title: string;
  description: string;
  category_id: number;
  difficulty: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected';
  is_ai_generated: true;
  questions: Question[];
  submitted_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  user_id: number;
}

