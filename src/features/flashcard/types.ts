import { User } from "../auth/types";

export type FlashcardSetStatus = "draft" | "published" | "archived";

export type FlashcardSetVisibility = "private" | "public";

export type FlashcardSourceType =
  | "manual"
  | "quiz_wrong_answers"
  | "ai_generated";

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
  explanation?: string | null;
  progress?: FlashcardProgress;
}

export interface FlashcardSetCategory {
  id: number | string;
  name: string;
}

export interface FlashcardSet {
  id: number | string;
  title: string;
  description: string;
  category: FlashcardSetCategory | null;
  categoryId?: number | string;
  sourceType?: FlashcardSourceType;
  visibility: FlashcardSetVisibility;
  status?: FlashcardSetStatus;
  cardCount: number;
  masteredCount: number;
  cards?: Flashcard[];
  user?: User;
}

export interface FlashcardDeck extends Omit<FlashcardSet, "cards"> {
  cards: Flashcard[];
  dueCount: number;
}

export interface FlashcardSetFilters {
  status?: FlashcardSetStatus;
  category_id?: number | string;
  category?: number | string;
  source_type?: FlashcardSourceType;
  visibility?: FlashcardSetVisibility;
  search?: string;
}

export interface CreateFlashcardSetPayload {
  title: string;
  category_id: number | null;
  visibility: FlashcardSetVisibility;
  source_type: "manual";
}

export interface AIFlashcardFromPromptPayload {
  prompt: string;
  number_of_cards: number;
  title: string;
  description: string | null;
  category_id: number | null;
  visibility: FlashcardSetVisibility;
}

export interface AIFlashcardFromFilePayload {
  file: {
    uri: string;
    name: string;
    type: string;
  };
  number_of_cards: number;
  title: string;
  description: string | null;
  category_id: number | null;
  visibility: FlashcardSetVisibility;
}

export interface AIFlashcardGenerationResponse {
  success?: boolean;
  message: string;
  data: FlashcardDeck;
  error?: string;
}

export interface CreateFlashcardCardPayload {
  term: string;
  definition: string;
  explanation?: string | null;
}

export interface UpdateFlashcardSetPayload {
  title: string;
  category_id: number | null;
  visibility: FlashcardSetVisibility;
}

export type UpdateFlashcardCardPayload = CreateFlashcardCardPayload;

export interface FlashcardSummary {
  totalSets: number;
  totalCards: number;
  masteredCount: number;
  needsReviewCount: number;
  dueReviewCount: number;
  newCount: number;
  setsBySource: {
    manual: number;
    quizWrongAnswers: number;
    aiGenerated: number;
  };
}

export type FlashcardSetWorkflowAction = "publish" | "archive";
