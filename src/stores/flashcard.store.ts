import { create } from "zustand";
import {
  approveFlashcardSet,
  archiveFlashcardSet,
  getFlashcardSetById,
  getFlashcardSets,
  getFlashcardStudySet,
  rejectFlashcardSet,
  reviewFlashcard,
  submitFlashcardSet,
} from "../features/flashcard/api";
import {
  Flashcard,
  FlashcardDeck,
  FlashcardProgress,
  FlashcardReviewRating,
  FlashcardSetFilters,
} from "../features/flashcard/types";

interface FlashcardState {
  decks: FlashcardDeck[];
  deckDetails: Record<string, FlashcardDeck>;
  studyDecks: Record<string, FlashcardDeck>;
  isLoading: boolean;
  isDetailLoading: boolean;
  isStudyLoading: boolean;
  isStatusUpdating: boolean;
  error?: string;
  fetchDecks: (filters?: FlashcardSetFilters) => Promise<void>;
  fetchDeckById: (id: number | string) => Promise<void>;
  fetchStudyDeck: (id: number | string) => Promise<void>;
  submitReview: (
    cardId: number | string,
    rating: FlashcardReviewRating,
    deckId?: number | string
  ) => Promise<void>;
  submitDeck: (id: number | string) => Promise<void>;
  approveDeck: (id: number | string) => Promise<void>;
  rejectDeck: (id: number | string, reason: string) => Promise<void>;
  archiveDeck: (id: number | string) => Promise<void>;
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Không thể tải dữ liệu flashcard.";
};

const upsertDeck = (
  state: FlashcardState,
  deck: FlashcardDeck,
  requestedId?: number | string
) => {
  const id = String(deck.id);
  const lookupId = requestedId ? String(requestedId) : id;
  const replaceDeck = (item: FlashcardDeck) =>
    String(item.id) === id || String(item.id) === lookupId ? deck : item;
  const hasDeck = state.decks.some(
    (item) => String(item.id) === id || String(item.id) === lookupId
  );

  return {
    decks: hasDeck ? state.decks.map(replaceDeck) : [deck, ...state.decks],
    deckDetails: {
      ...state.deckDetails,
      [id]: deck,
      [lookupId]: deck,
    },
    studyDecks: state.studyDecks[lookupId]
      ? {
          ...state.studyDecks,
          [lookupId]: {
            ...state.studyDecks[lookupId],
            ...deck,
            cards:
              deck.cards.length > 0 ? deck.cards : state.studyDecks[lookupId].cards,
          },
        }
      : state.studyDecks,
  };
};

const getNextReviewAt = (rating: FlashcardReviewRating) => {
  const nextReview = new Date();

  if (rating === "again") {
    nextReview.setHours(nextReview.getHours() + 1);
  } else if (rating === "hard") {
    nextReview.setDate(nextReview.getDate() + 1);
  } else {
    nextReview.setDate(nextReview.getDate() + 7);
  }

  return nextReview.toISOString();
};

const getReviewedProgress = (
  card: Flashcard,
  rating: FlashcardReviewRating
): FlashcardProgress => {
  const previousProgress = card.progress;

  return {
    status: rating === "easy" ? "mastered" : "learning",
    correctCount:
      (previousProgress?.correctCount || 0) + (rating === "again" ? 0 : 1),
    reviewCount: (previousProgress?.reviewCount || 0) + 1,
    nextReviewAt: getNextReviewAt(rating),
  };
};

const isCardDue = (card: Flashcard) => {
  if (!card.progress) {
    return true;
  }

  if (card.progress.nextReviewAt) {
    return new Date(card.progress.nextReviewAt).getTime() <= Date.now();
  }

  return card.progress.status !== "mastered";
};

const recalculateDeckProgress = (deck: FlashcardDeck): FlashcardDeck => {
  if (deck.cards.length === 0) {
    return deck;
  }

  return {
    ...deck,
    cardCount: deck.cards.length,
    masteredCount: deck.cards.filter(
      (card) => card.progress?.status === "mastered"
    ).length,
    dueCount: deck.cards.filter(isCardDue).length,
  };
};

const reviewDeckCard = (
  deck: FlashcardDeck,
  cardId: number | string,
  rating: FlashcardReviewRating
) => {
  let changed = false;

  const cards = deck.cards.map((card) => {
    if (String(card.id) !== String(cardId)) {
      return card;
    }

    changed = true;

    return {
      ...card,
      progress: getReviewedProgress(card, rating),
    };
  });

  return {
    changed,
    deck: changed ? recalculateDeckProgress({ ...deck, cards }) : deck,
  };
};

const reviewDeckSummary = (
  deck: FlashcardDeck,
  rating: FlashcardReviewRating
): FlashcardDeck => ({
  ...deck,
  masteredCount:
    rating === "easy"
      ? Math.min(deck.masteredCount + 1, deck.cardCount)
      : deck.masteredCount,
  dueCount: Math.max(deck.dueCount - 1, 0),
});

const updateDeckRecord = (
  record: Record<string, FlashcardDeck>,
  cardId: number | string,
  rating: FlashcardReviewRating,
  deckId?: number | string
) => {
  let reviewedDeck: FlashcardDeck | undefined;
  const updatedRecord = Object.fromEntries(
    Object.entries(record).map(([key, deck]) => {
      const result = reviewDeckCard(deck, cardId, rating);

      if (result.changed) {
        reviewedDeck = result.deck;
      }

      return [key, result.deck];
    })
  );

  if (deckId && reviewedDeck) {
    updatedRecord[String(deckId)] = reviewedDeck;
    updatedRecord[String(reviewedDeck.id)] = reviewedDeck;
  }

  return { updatedRecord, reviewedDeck };
};

const updateReviewedCard = (
  state: FlashcardState,
  cardId: number | string,
  rating: FlashcardReviewRating,
  deckId?: number | string
) => {
  const detailUpdate = updateDeckRecord(state.deckDetails, cardId, rating, deckId);
  const studyUpdate = updateDeckRecord(state.studyDecks, cardId, rating, deckId);
  const reviewedDeck = studyUpdate.reviewedDeck || detailUpdate.reviewedDeck;

  const decks = state.decks.map((deck) => {
    const result = reviewDeckCard(deck, cardId, rating);

    if (result.changed) {
      return result.deck;
    }

    if (deckId && String(deck.id) === String(deckId)) {
      return reviewedDeck
        ? {
            ...deck,
            cardCount: reviewedDeck.cardCount,
            masteredCount: reviewedDeck.masteredCount,
            dueCount: reviewedDeck.dueCount,
          }
        : reviewDeckSummary(deck, rating);
    }

    return deck;
  });

  return {
    decks,
    deckDetails: detailUpdate.updatedRecord,
    studyDecks: studyUpdate.updatedRecord,
    error: undefined,
  };
};

export const useFlashcardStore = create<FlashcardState>((set) => ({
  decks: [],
  deckDetails: {},
  studyDecks: {},
  isLoading: false,
  isDetailLoading: false,
  isStudyLoading: false,
  isStatusUpdating: false,

  fetchDecks: async (filters) => {
    set({ isLoading: true, error: undefined });
    try {
      const decks = await getFlashcardSets(filters);
      set({ decks });
    } catch (error) {
      console.error("Lỗi lấy danh sách flashcard:", error);
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDeckById: async (id) => {
    set({ isDetailLoading: true, error: undefined });
    try {
      const deck = await getFlashcardSetById(id);
      set((state) => ({
        deckDetails: { ...state.deckDetails, [String(id)]: deck },
      }));
    } catch (error) {
      console.error("Lỗi lấy chi tiết flashcard:", error);
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isDetailLoading: false });
    }
  },

  fetchStudyDeck: async (id) => {
    set({ isStudyLoading: true, error: undefined });
    try {
      const deck = await getFlashcardStudySet(id);
      set((state) => ({
        studyDecks: { ...state.studyDecks, [String(id)]: deck },
      }));
    } catch (error) {
      console.error("Lỗi lấy dữ liệu học flashcard:", error);
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isStudyLoading: false });
    }
  },

  submitReview: async (cardId, rating, deckId) => {
    try {
      await reviewFlashcard(cardId, rating);
      set((state) => updateReviewedCard(state, cardId, rating, deckId));
    } catch (error) {
      console.error("Lỗi cập nhật tiến độ flashcard:", error);
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  submitDeck: async (id) => {
    set({ isStatusUpdating: true, error: undefined });
    try {
      const submittedDeck = (await submitFlashcardSet(id)) || (await getFlashcardSetById(id));
      set((state) => upsertDeck(state, submittedDeck, id));
    } catch (error) {
      console.error("Lỗi gửi duyệt flashcard:", error);
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ isStatusUpdating: false });
    }
  },

  approveDeck: async (id) => {
    set({ isStatusUpdating: true, error: undefined });
    try {
      const approvedDeck = (await approveFlashcardSet(id)) || (await getFlashcardSetById(id));
      set((state) => upsertDeck(state, approvedDeck, id));
    } catch (error) {
      console.error("Lỗi duyệt flashcard:", error);
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ isStatusUpdating: false });
    }
  },

  rejectDeck: async (id, reason) => {
    set({ isStatusUpdating: true, error: undefined });
    try {
      const rejectedDeck =
        (await rejectFlashcardSet(id, reason)) || (await getFlashcardSetById(id));
      set((state) => upsertDeck(state, rejectedDeck, id));
    } catch (error) {
      console.error("Lỗi từ chối flashcard:", error);
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ isStatusUpdating: false });
    }
  },

  archiveDeck: async (id) => {
    set({ isStatusUpdating: true, error: undefined });
    try {
      const archivedDeck = (await archiveFlashcardSet(id)) || (await getFlashcardSetById(id));
      set((state) => upsertDeck(state, archivedDeck, id));
    } catch (error) {
      console.error("Lỗi lưu trữ flashcard:", error);
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ isStatusUpdating: false });
    }
  },
}));
