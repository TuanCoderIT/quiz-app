import { axiosAPI } from "../../services/api/client";
import { WithUnlockedAchievements } from "../gamification/types";
import {
    AIFlashcardGenerationResponse,
    AIFlashcardFromPromptPayload,
    CreateFlashcardCardPayload,
    CreateFlashcardSetPayload,
    Flashcard,
    FlashcardDeck,
    FlashcardProgress,
    FlashcardReviewRating,
    FlashcardSetCategory,
    FlashcardSetFilters,
    FlashcardSummary,
    UpdateFlashcardCardPayload,
    UpdateFlashcardSetPayload,
} from "./types";

type ApiResponse<T> =
  | T
  | {
      success?: boolean;
      message?: string;
      data?: T;
    };

type PaginatedResponse<T> = {
  data: T[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const unwrapData = <T>(payload: ApiResponse<T>): T => {
  if (isRecord(payload) && "data" in payload && payload.data) {
    return payload.data as T;
  }

  return payload as T;
};

const pickRecord = (
  payload: unknown,
  keys: string[],
): Record<string, unknown> | undefined => {
  if (!isRecord(payload)) {
    return undefined;
  }

  for (const key of keys) {
    const value = payload[key];

    if (isRecord(value)) {
      return value;
    }
  }

  return payload;
};

const getString = (
  record: Record<string, unknown>,
  keys: string[],
  fallback = "",
) => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string") {
      return value;
    }
  }

  return fallback;
};

const getNumber = (
  record: Record<string, unknown>,
  keys: string[],
  fallback = 0,
) => {
  for (const key of keys) {
    const numericValue = Number(record[key]);

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return fallback;
};

const normalizeSummary = (payload: unknown): FlashcardSummary => {
  const record = unwrapData(payload as ApiResponse<Record<string, unknown>>);
  const setsBySource = isRecord(record.setsBySource)
    ? record.setsBySource
    : isRecord(record.sets_by_source)
      ? record.sets_by_source
      : {};

  return {
    totalSets: getNumber(record, ["totalSets", "total_sets"]),
    totalCards: getNumber(record, ["totalCards", "total_cards"]),
    masteredCount: getNumber(record, ["masteredCount", "mastered_count"]),
    needsReviewCount: getNumber(record, [
      "needsReviewCount",
      "needs_review_count",
    ]),
    dueReviewCount: getNumber(record, ["dueReviewCount", "due_review_count"]),
    newCount: getNumber(record, ["newCount", "new_count"]),
    setsBySource: {
      manual: getNumber(setsBySource, ["manual"]),
      quizWrongAnswers: getNumber(setsBySource, [
        "quizWrongAnswers",
        "quiz_wrong_answers",
      ]),
      aiGenerated: getNumber(setsBySource, ["aiGenerated", "ai_generated"]),
    },
  };
};

const normalizeCard = (
  card: Flashcard | Record<string, unknown>,
): Flashcard => {
  const record = card as Record<string, unknown>;

  return {
    ...(card as Flashcard),
    id: record.id as number | string,
    term: getString(
      record,
      ["term", "front_text", "frontText", "question"],
      "Mặt trước",
    ),
    definition: getString(
      record,
      ["definition", "back_text", "backText", "answer"],
      "Mặt sau",
    ),
    explanation:
      record.explanation === null
        ? null
        : getString(record, ["explanation"], undefined),
  };
};

const unwrapList = (
  payload: ApiResponse<FlashcardDeck[] | PaginatedResponse<FlashcardDeck>>,
) => {
  const data = unwrapData(payload);

  if (Array.isArray(data)) {
    return data;
  }

  return data.data ?? [];
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

const normalizeCategory = (
  category: unknown,
  categoryId?: unknown,
): FlashcardSetCategory | null => {
  if (!category) {
    return null;
  }

  if (isRecord(category)) {
    return {
      id: (category.id ?? categoryId) as number | string,
      name: getString(category, ["name"], "Flashcard"),
    };
  }

  if (typeof category === "string") {
    return {
      id: (categoryId ?? category) as number | string,
      name: category,
    };
  }

  return null;
};

const normalizeDeck = (
  deck: FlashcardDeck | Record<string, unknown>,
): FlashcardDeck => {
  const record =
    pickRecord(deck, ["flashcardSet", "flashcard_set", "set"]) || {};
  const cardsPayload = record.cards || record.flashcards;
  const cards = Array.isArray(cardsPayload)
    ? cardsPayload.map((card) =>
        normalizeCard(card as Flashcard | Record<string, unknown>),
      )
    : [];
  const cardCount = getNumber(
    record,
    ["cardCount", "cards_count", "flashcards_count", "card_count"],
    cards.length,
  );
  const masteredCount = getNumber(record, ["masteredCount", "mastered_count"]);
  const categoryId = record.categoryId || record.category_id;
  const category = normalizeCategory(record.category, categoryId);
  const normalizedDeck = {
    ...(record as unknown as FlashcardDeck),
    id: record.id as number | string,
    title: getString(record, ["title"], "Bộ thẻ chưa đặt tên"),
    description: getString(
      record,
      ["description"],
      "Ôn tập các thẻ ghi nhớ trong bộ này.",
    ),
    category,
    categoryId: categoryId as number | string | undefined,
    sourceType: getString(
      record,
      ["sourceType", "source_type"],
      undefined,
    ) as FlashcardDeck["sourceType"],
    visibility: getString(
      record,
      ["visibility"],
      "private",
    ) as FlashcardDeck["visibility"],
    status: getString(record, ["status"], undefined) as FlashcardDeck["status"],
    cardCount,
    masteredCount,
    cards,
  };

  return {
    ...normalizedDeck,
    dueCount:
      cards.length > 0
        ? cards.filter(isDue).length
        : Math.max(cardCount - masteredCount, 0),
  };
};

export const getFlashcardSets = async (
  filters?: FlashcardSetFilters,
): Promise<FlashcardDeck[]> => {
  const response = await axiosAPI.get<
    ApiResponse<FlashcardDeck[] | PaginatedResponse<FlashcardDeck>>
  >("/flashcard-sets", { params: filters });

  return unwrapList(response.data).map(normalizeDeck);
};

export const getFlashcardSummary = async (): Promise<FlashcardSummary> => {
  const response = await axiosAPI.get<ApiResponse<FlashcardSummary>>(
    "/flashcard-sets/summary",
  );

  return normalizeSummary(response.data);
};

export const getFlashcardSetById = async (
  id: number | string,
): Promise<FlashcardDeck> => {
  const response = await axiosAPI.get<ApiResponse<FlashcardDeck>>(
    `/flashcard-sets/${id}`,
  );

  return normalizeDeck(unwrapData(response.data));
};

export const getFlashcardStudySet = async (
  id: number | string,
): Promise<FlashcardDeck> => {
  const response = await axiosAPI.get<ApiResponse<FlashcardDeck>>(
    `/flashcard-sets/${id}/study`,
  );

  return normalizeDeck(unwrapData(response.data));
};

export const reviewFlashcard = async (
  id: number | string,
  rating: FlashcardReviewRating,
): Promise<FlashcardProgress & WithUnlockedAchievements> => {
  const response = await axiosAPI.post<
    ApiResponse<FlashcardProgress & WithUnlockedAchievements>
  >(`/flashcards/${id}/review`, { rating });

  return unwrapData(response.data);
};

export const publishFlashcardSet = async (
  id: number | string,
): Promise<FlashcardDeck> => {
  const response = await axiosAPI.post<ApiResponse<FlashcardDeck>>(
    `/flashcard-sets/${id}/publish`,
  );

  return normalizeDeck(unwrapData(response.data));
};

export const updateFlashcardSet = async (
  id: number | string,
  payload: UpdateFlashcardSetPayload,
): Promise<FlashcardDeck> => {
  const response = await axiosAPI.patch<ApiResponse<FlashcardDeck>>(
    `/flashcard-sets/${id}`,
    payload,
  );

  return normalizeDeck(unwrapData(response.data));
};

export const deleteFlashcardSet = async (
  id: number | string,
): Promise<void> => {
  await axiosAPI.delete(`/flashcard-sets/${id}`);
};

export const createFlashcardSet = async (
  payload: CreateFlashcardSetPayload,
): Promise<FlashcardDeck> => {
  const response = await axiosAPI.post<ApiResponse<FlashcardDeck>>(
    "/flashcard-sets",
    payload,
  );

  return normalizeDeck(unwrapData(response.data));
};

export const createFlashcardCard = async (
  setId: number | string,
  payload: CreateFlashcardCardPayload,
): Promise<Flashcard> => {
  const response = await axiosAPI.post<ApiResponse<Flashcard>>(
    `/flashcard-sets/${setId}/cards`,
    payload,
  );

  return normalizeCard(
    unwrapData(response.data) as Flashcard | Record<string, unknown>,
  );
};

export const updateFlashcardCard = async (
  cardId: number | string,
  payload: UpdateFlashcardCardPayload,
): Promise<Flashcard> => {
  const response = await axiosAPI.put<ApiResponse<Flashcard>>(
    `/flashcards/${cardId}`,
    payload,
  );

  return normalizeCard(
    unwrapData(response.data) as Flashcard | Record<string, unknown>,
  );
};

export const deleteFlashcardCard = async (
  cardId: number | string,
): Promise<void> => {
  await axiosAPI.delete(`/flashcards/${cardId}`);
};

export const createManualFlashcardSet = async (
  payload: CreateFlashcardSetPayload,
  cards: CreateFlashcardCardPayload[],
): Promise<FlashcardDeck> => {
  const deck = await createFlashcardSet(payload);

  await Promise.all(cards.map((card) => createFlashcardCard(deck.id, card)));

  return getFlashcardSetById(deck.id);
};

export const generateFlashcardSetFromPrompt = async (
  payload: AIFlashcardFromPromptPayload,
): Promise<AIFlashcardGenerationResponse> => {
  console.log("AI flashcard prompt payload:", JSON.stringify(payload, null, 2));

  const response = await axiosAPI.post<ApiResponse<FlashcardDeck>>(
    "/flashcard-sets/ai-generate-from-prompt",
    payload,
  );
  const message =
    isRecord(response.data) && typeof response.data.message === "string"
      ? response.data.message
      : "Tạo bộ thẻ bằng AI thành công.";

  return {
    success: isRecord(response.data) ? response.data.success as boolean : true,
    message,
    data: normalizeDeck(unwrapData(response.data)),
  };
};

export const generateFlashcardSetFromFile = async (
  formData: FormData,
): Promise<AIFlashcardGenerationResponse> => {
  console.log("AI flashcard file form:", formData);

  const response = await axiosAPI.post<ApiResponse<FlashcardDeck>>(
    "/flashcard-sets/ai-generate-from-file",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  const message =
    isRecord(response.data) && typeof response.data.message === "string"
      ? response.data.message
      : "Tạo bộ thẻ bằng AI thành công.";

  return {
    success: isRecord(response.data) ? response.data.success as boolean : true,
    message,
    data: normalizeDeck(unwrapData(response.data)),
  };
};

export const generateWrongAnswerFlashcards = async (
  resultId: number | string,
): Promise<{
  flashcardSet: FlashcardDeck;
  flashcardsCount: number;
  flashcards: Flashcard[];
}> => {
  const response = await axiosAPI.post<
    ApiResponse<{
      flashcardSet: FlashcardDeck;
      flashcardsCount: number;
      flashcards: Flashcard[];
    }>
  >(`/results/${resultId}/generate-wrong-answer-flashcards`);

  const data = unwrapData(response.data);

  return {
    ...data,
    flashcardSet: normalizeDeck(data.flashcardSet),
  };
};

export const archiveFlashcardSet = async (
  id: number | string,
): Promise<FlashcardDeck> => {
  const response = await axiosAPI.post<ApiResponse<FlashcardDeck>>(
    `/flashcard-sets/${id}/archive`,
  );

  return normalizeDeck(unwrapData(response.data));
};
