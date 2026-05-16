import { axiosAPI } from "../../services/api/client";
import { Category } from "../../types/category";
import {
  Flashcard,
  FlashcardDeck,
  FlashcardProgress,
  FlashcardReviewRating,
  FlashcardSetFilters,
} from "./types";

type ApiCategory = Category | string | null | undefined;

type ApiFlashcardProgress = {
  status?: string;
  correct_count?: number | string;
  correctCount?: number | string;
  review_count?: number | string;
  reviewCount?: number | string;
  next_review_at?: string;
  nextReviewAt?: string;
};

type ApiFlashcard = {
  id?: number | string;
  front_text?: string;
  frontText?: string;
  term?: string;
  question?: string;
  back_text?: string;
  backText?: string;
  definition?: string;
  answer?: string;
  explanation?: string;
  progress?: ApiFlashcardProgress | null;
  user_progress?: ApiFlashcardProgress | null;
};

type ApiFlashcardSet = {
  id?: number | string;
  title?: string;
  description?: string | null;
  category_id?: number | string;
  categoryId?: number | string;
  category?: ApiCategory;
  source_type?: string;
  sourceType?: string;
  status?: string;
  cards_count?: number | string;
  flashcards_count?: number | string;
  card_count?: number | string;
  cardsCount?: number | string;
  mastered_count?: number | string;
  masteredCount?: number | string;
  due_count?: number | string;
  dueCount?: number | string;
  review_due_count?: number | string;
  estimated_minutes?: number | string;
  estimatedMinutes?: number | string;
  flashcards?: ApiFlashcard[];
  cards?: ApiFlashcard[];
};

type ListResponse =
  | ApiFlashcardSet[]
  | {
      data?: ApiFlashcardSet[] | { data?: ApiFlashcardSet[] };
      sets?: ApiFlashcardSet[];
      flashcard_sets?: ApiFlashcardSet[];
    };

type DetailResponse =
  | ApiFlashcardSet
  | {
      data?: ApiFlashcardSet;
      set?: ApiFlashcardSet;
      flashcard_set?: ApiFlashcardSet;
    };

const accents = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E"];
const washes = ["#EEF2FF", "#ECFEFF", "#F0FDF4", "#FFFBEB", "#FFF1F2"];

const sourceTypeLabels: Record<string, string> = {
  manual: "Tự tạo",
  quiz_wrong_answers: "Câu sai",
  ai_generated: "AI",
};

const toNumber = (value: number | string | undefined, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const normalizeId = (value: number | string | undefined, fallback: number) => {
  if (value === undefined || value === "") {
    return fallback;
  }

  return value;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isApiFlashcardSet = (value: unknown): value is ApiFlashcardSet =>
  isRecord(value) &&
  ("id" in value ||
    "title" in value ||
    "status" in value ||
    "cards" in value ||
    "flashcards" in value ||
    "flashcards_count" in value);

const extractDeckPayload = (payload: unknown): ApiFlashcardSet | undefined => {
  if (isApiFlashcardSet(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return undefined;
  }

  return (
    extractDeckPayload(payload.data) ||
    extractDeckPayload(payload.set) ||
    extractDeckPayload(payload.flashcard_set)
  );
};

const normalizeFlashcardMutation = (payload: unknown) => {
  const deckPayload = extractDeckPayload(payload);
  return deckPayload ? normalizeFlashcardDeck(deckPayload) : undefined;
};

const unwrapList = (payload: ListResponse): ApiFlashcardSet[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.flashcard_sets)) {
    return payload.flashcard_sets;
  }

  if (Array.isArray(payload.sets)) {
    return payload.sets;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.data && "data" in payload.data && Array.isArray(payload.data.data)) {
    return payload.data.data;
  }

  return [];
};

const unwrapDetail = (payload: DetailResponse): ApiFlashcardSet => {
  if ("data" in payload && payload.data) {
    return payload.data;
  }

  if ("flashcard_set" in payload && payload.flashcard_set) {
    return payload.flashcard_set;
  }

  if ("set" in payload && payload.set) {
    return payload.set;
  }

  return payload as ApiFlashcardSet;
};

const normalizeCategoryName = (category: ApiCategory, fallback = "Flashcard") => {
  if (!category) {
    return fallback;
  }

  return typeof category === "string" ? category : category.name || fallback;
};

const normalizeCategoryData = (category: ApiCategory): Category | undefined => {
  if (!category || typeof category === "string") {
    return undefined;
  }

  return category;
};

const normalizeProgress = (
  progress?: ApiFlashcardProgress | null
): FlashcardProgress | undefined => {
  if (!progress) {
    return undefined;
  }

  return {
    status: progress.status || "new",
    correctCount: toNumber(progress.correct_count ?? progress.correctCount),
    reviewCount: toNumber(progress.review_count ?? progress.reviewCount),
    nextReviewAt: progress.next_review_at || progress.nextReviewAt,
  };
};

const isDue = (card: Flashcard) => {
  if (!card.progress) {
    return true;
  }

  if (card.progress.nextReviewAt) {
    return new Date(card.progress.nextReviewAt).getTime() <= Date.now();
  }

  return card.progress.status !== "mastered";
};

const normalizeCard = (card: ApiFlashcard, index: number): Flashcard => {
  const progress = normalizeProgress(card.progress || card.user_progress);

  return {
    id: normalizeId(card.id, index + 1),
    term: card.front_text || card.frontText || card.term || card.question || "Mặt trước",
    definition:
      card.back_text || card.backText || card.definition || card.answer || "Mặt sau",
    explanation: card.explanation,
    progress,
  };
};

export const normalizeFlashcardDeck = (
  set: ApiFlashcardSet,
  index = 0
): FlashcardDeck => {
  const cards = (set.flashcards || set.cards || []).map(normalizeCard);
  const cardCount = toNumber(
    set.cards_count ?? set.flashcards_count ?? set.card_count ?? set.cardsCount,
    cards.length
  );
  const masteredCount = toNumber(
    set.mastered_count ?? set.masteredCount,
    cards.filter((card) => card.progress?.status === "mastered").length
  );
  const dueCount = toNumber(
    set.due_count ?? set.dueCount ?? set.review_due_count,
    cards.length > 0 ? cards.filter(isDue).length : Math.max(cardCount - masteredCount, 0)
  );
  const sourceType = set.source_type || set.sourceType;
  const categoryName = normalizeCategoryName(
    set.category,
    sourceType ? sourceTypeLabels[sourceType] || sourceType : "Flashcard"
  );
  const paletteIndex = Math.abs(toNumber(set.id, index)) % accents.length;

  return {
    id: normalizeId(set.id, index + 1),
    title: set.title || "Bộ thẻ chưa đặt tên",
    description: set.description || "Ôn tập các thẻ ghi nhớ trong bộ này.",
    category: categoryName,
    categoryId: set.category_id ?? set.categoryId,
    categoryData: normalizeCategoryData(set.category),
    sourceType,
    status: set.status,
    cardCount,
    masteredCount,
    dueCount,
    estimatedMinutes: toNumber(
      set.estimated_minutes ?? set.estimatedMinutes,
      Math.max(5, Math.ceil(cardCount * 0.5))
    ),
    color: washes[paletteIndex],
    accent: accents[paletteIndex],
    cards,
  };
};

export const getFlashcardSets = async (
  filters?: FlashcardSetFilters
): Promise<FlashcardDeck[]> => {
  const response = await axiosAPI.get<ListResponse>("/flashcard-sets", {
    params: filters,
  });

  return unwrapList(response.data).map(normalizeFlashcardDeck);
};

export const getFlashcardSetById = async (
  id: number | string
): Promise<FlashcardDeck> => {
  const response = await axiosAPI.get<DetailResponse>(`/flashcard-sets/${id}`);
  return normalizeFlashcardDeck(unwrapDetail(response.data));
};

export const getFlashcardStudySet = async (
  id: number | string
): Promise<FlashcardDeck> => {
  const response = await axiosAPI.get<DetailResponse>(`/flashcard-sets/${id}/study`);
  return normalizeFlashcardDeck(unwrapDetail(response.data));
};

export const reviewFlashcard = async (
  id: number | string,
  rating: FlashcardReviewRating
) => {
  const response = await axiosAPI.post(`/flashcards/${id}/review`, { rating });
  return response.data?.data || response.data;
};

export const submitFlashcardSet = async (id: number | string) => {
  const response = await axiosAPI.post(`/flashcard-sets/${id}/submit`);
  return normalizeFlashcardMutation(response.data);
};

export const approveFlashcardSet = async (id: number | string) => {
  const response = await axiosAPI.post(`/admin/flashcard-sets/${id}/approve`);
  return normalizeFlashcardMutation(response.data);
};

export const rejectFlashcardSet = async (id: number | string, reason: string) => {
  const response = await axiosAPI.post(`/admin/flashcard-sets/${id}/reject`, {
    reason,
  });
  return normalizeFlashcardMutation(response.data);
};

export const archiveFlashcardSet = async (id: number | string) => {
  const response = await axiosAPI.post(`/admin/flashcard-sets/${id}/archive`);
  return normalizeFlashcardMutation(response.data);
};
