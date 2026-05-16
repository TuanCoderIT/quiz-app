import { Category } from "../../types/category";

export type FlashcardSetStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "archived"
  | string;

export type FlashcardSourceType =
  | "manual"
  | "quiz_wrong_answers"
  | "ai_generated"
  | string;

export type FlashcardProgressStatus = "new" | "learning" | "mastered" | string;

export type FlashcardReviewRating = "again" | "hard" | "easy";

export interface FlashcardProgress {
  status: FlashcardProgressStatus;
  correctCount: number;
  reviewCount: number;
  nextReviewAt?: string;
}

export interface Flashcard {
  id: number | string;
  term: string;
  definition: string;
  explanation?: string;
  progress?: FlashcardProgress;
}

export interface FlashcardDeck {
  id: number | string;
  title: string;
  description: string;
  category: string;
  categoryId?: number | string;
  categoryData?: Category;
  sourceType?: FlashcardSourceType;
  status?: FlashcardSetStatus;
  cardCount: number;
  masteredCount: number;
  dueCount: number;
  estimatedMinutes: number;
  color: string;
  accent: string;
  cards: Flashcard[];
}

export interface FlashcardSetFilters {
  status?: FlashcardSetStatus;
  category?: number | string;
  source_type?: FlashcardSourceType;
}

export type FlashcardSetWorkflowAction = "submit" | "approve" | "reject" | "archive";
