// src/types/question.ts
export interface Question {
  id: number;
  content: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: Record<string, string>;
  // options?: string[];
  answer: string;
  explanation?: string;
  points: number;
}

export interface QuizData {
  id: number;
  title: string;
  duration: number;
  questions: Question[];
}

export interface RawQuestion {
  id: number;
  content: string;
  options: Record<string, string>; // vì là object { A: "...", B: "..." }
  answer: string;
  explanation?: string;
}
