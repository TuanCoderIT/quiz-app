import { create } from "zustand";
import { useGamificationStore } from "../gamification/store";
import {
    archiveFlashcardSet,
    createFlashcardCard,
    deleteFlashcardCard,
    deleteFlashcardSet,
    getFlashcardSetById,
    getFlashcardSets,
    getFlashcardStudySet,
    publishFlashcardSet,
    reviewFlashcard,
    updateFlashcardCard,
    updateFlashcardSet,
} from "./api";
import {
    CreateFlashcardCardPayload,
    Flashcard,
    FlashcardDeck,
    FlashcardProgress,
    FlashcardReviewRating,
    FlashcardSetFilters,
    UpdateFlashcardCardPayload,
    UpdateFlashcardSetPayload,
} from "./types";

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
    deckId?: number | string,
  ) => Promise<void>;
  updateDeck: (
    id: number | string,
    payload: UpdateFlashcardSetPayload,
  ) => Promise<void>;
  deleteDeck: (id: number | string) => Promise<void>;
  addCard: (
    deckId: number | string,
    payload: CreateFlashcardCardPayload,
  ) => Promise<void>;
  updateCard: (
    cardId: number | string,
    payload: UpdateFlashcardCardPayload,
  ) => Promise<void>;
  deleteCard: (
    cardId: number | string,
    deckId?: number | string,
  ) => Promise<void>;
  publishDeck: (id: number | string) => Promise<void>;
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
  requestedId?: number | string,
) => {
  const id = String(deck.id);
  const lookupId = requestedId ? String(requestedId) : id;
  const replaceDeck = (item: FlashcardDeck) =>
    String(item.id) === id || String(item.id) === lookupId ? deck : item;
  const hasDeck = state.decks.some(
    (item) => String(item.id) === id || String(item.id) === lookupId,
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
              deck.cards.length > 0
                ? deck.cards
                : state.studyDecks[lookupId].cards,
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
  rating: FlashcardReviewRating,
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
      (card) => card.progress?.status === "mastered",
    ).length,
    dueCount: deck.cards.filter(isCardDue).length,
  };
};

const reviewDeckCard = (
  deck: FlashcardDeck,
  cardId: number | string,
  rating: FlashcardReviewRating,
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
  rating: FlashcardReviewRating,
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
  deckId?: number | string,
) => {
  let reviewedDeck: FlashcardDeck | undefined;
  const updatedRecord = Object.fromEntries(
    Object.entries(record).map(([key, deck]) => {
      const result = reviewDeckCard(deck, cardId, rating);

      if (result.changed) {
        reviewedDeck = result.deck;
      }

      return [key, result.deck];
    }),
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
  deckId?: number | string,
) => {
  const detailUpdate = updateDeckRecord(
    state.deckDetails,
    cardId,
    rating,
    deckId,
  );
  const studyUpdate = updateDeckRecord(
    state.studyDecks,
    cardId,
    rating,
    deckId,
  );
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

const removeDeckFromState = (state: FlashcardState, id: number | string) => {
  const key = String(id);
  const { [key]: _detail, ...deckDetails } = state.deckDetails;
  const { [key]: _study, ...studyDecks } = state.studyDecks;

  return {
    decks: state.decks.filter((deck) => String(deck.id) !== key),
    deckDetails,
    studyDecks,
  };
};

const replaceCardInDeck = (
  deck: FlashcardDeck,
  card: Flashcard,
): FlashcardDeck => ({
  ...deck,
  cards: deck.cards.map((item) =>
    String(item.id) === String(card.id) ? card : item,
  ),
});

const appendCardToDeck = (
  deck: FlashcardDeck,
  card: Flashcard,
): FlashcardDeck => ({
  ...deck,
  cards: [...deck.cards, card],
  cardCount: deck.cardCount + 1,
  dueCount: deck.dueCount + 1,
});

const removeCardFromDeck = (
  deck: FlashcardDeck,
  cardId: number | string,
): FlashcardDeck => {
  const cards = deck.cards.filter((card) => String(card.id) !== String(cardId));

  return {
    ...deck,
    cards,
    cardCount: Math.max(deck.cardCount - 1, cards.length),
    masteredCount: Math.min(deck.masteredCount, cards.length),
    dueCount: cards.filter(isCardDue).length,
  };
};

const updateCardRecords = (
  record: Record<string, FlashcardDeck>,
  updater: (deck: FlashcardDeck) => FlashcardDeck,
) =>
  Object.fromEntries(
    Object.entries(record).map(([key, deck]) => [key, updater(deck)]),
  );

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
      const result = await reviewFlashcard(cardId, rating);
      set((state) => updateReviewedCard(state, cardId, rating, deckId));
      // Fire gamification refresh — pass any unlocked achievements for popup queue
      useGamificationStore
        .getState()
        .refreshAfterAction(result.unlocked_achievements ?? []);
    } catch (error) {
      console.error("Lỗi cập nhật tiến độ flashcard:", error);
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  updateDeck: async (id, payload) => {
    set({ isStatusUpdating: true, error: undefined });
    try {
      const updatedDeck = await updateFlashcardSet(id, payload);
      set((state) => upsertDeck(state, updatedDeck, id));
    } catch (error) {
      console.error("Lỗi cập nhật flashcard set:", error);
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ isStatusUpdating: false });
    }
  },

  deleteDeck: async (id) => {
    set({ isStatusUpdating: true, error: undefined });
    try {
      try {
        await deleteFlashcardSet(id);
        set((state) => removeDeckFromState(state, id));
      } catch {
        const archivedDeck = await archiveFlashcardSet(id);
        set((state) => upsertDeck(state, archivedDeck, id));
      }
    } catch (error) {
      console.error("Lỗi xóa flashcard set:", error);
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ isStatusUpdating: false });
    }
  },

  addCard: async (deckId, payload) => {
    set({ isStatusUpdating: true, error: undefined });
    try {
      const card = await createFlashcardCard(deckId, payload);
      set((state) => ({
        decks: state.decks.map((deck) =>
          String(deck.id) === String(deckId)
            ? appendCardToDeck(deck, card)
            : deck,
        ),
        deckDetails: updateCardRecords(state.deckDetails, (deck) =>
          String(deck.id) === String(deckId)
            ? appendCardToDeck(deck, card)
            : deck,
        ),
        studyDecks: updateCardRecords(state.studyDecks, (deck) =>
          String(deck.id) === String(deckId)
            ? appendCardToDeck(deck, card)
            : deck,
        ),
      }));
    } catch (error) {
      console.error("Lỗi thêm flashcard:", error);
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ isStatusUpdating: false });
    }
  },

  updateCard: async (cardId, payload) => {
    set({ isStatusUpdating: true, error: undefined });
    try {
      const card = await updateFlashcardCard(cardId, payload);
      set((state) => ({
        decks: state.decks.map((deck) => replaceCardInDeck(deck, card)),
        deckDetails: updateCardRecords(state.deckDetails, (deck) =>
          replaceCardInDeck(deck, card),
        ),
        studyDecks: updateCardRecords(state.studyDecks, (deck) =>
          replaceCardInDeck(deck, card),
        ),
      }));
    } catch (error) {
      console.error("Lỗi cập nhật flashcard:", error);
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ isStatusUpdating: false });
    }
  },

  deleteCard: async (cardId, deckId) => {
    set({ isStatusUpdating: true, error: undefined });
    try {
      await deleteFlashcardCard(cardId);
      set((state) => ({
        decks: state.decks.map((deck) =>
          deckId && String(deck.id) !== String(deckId)
            ? deck
            : removeCardFromDeck(deck, cardId),
        ),
        deckDetails: updateCardRecords(state.deckDetails, (deck) =>
          deckId && String(deck.id) !== String(deckId)
            ? deck
            : removeCardFromDeck(deck, cardId),
        ),
        studyDecks: updateCardRecords(state.studyDecks, (deck) =>
          deckId && String(deck.id) !== String(deckId)
            ? deck
            : removeCardFromDeck(deck, cardId),
        ),
      }));
    } catch (error) {
      console.error("Lỗi xóa flashcard:", error);
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ isStatusUpdating: false });
    }
  },

  publishDeck: async (id) => {
    set({ isStatusUpdating: true, error: undefined });
    try {
      const publishedDeck = await publishFlashcardSet(id);
      set((state) => upsertDeck(state, publishedDeck, id));
    } catch (error) {
      console.error("Lỗi chia sẻ flashcard:", error);
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ isStatusUpdating: false });
    }
  },

  archiveDeck: async (id) => {
    set({ isStatusUpdating: true, error: undefined });
    try {
      const archivedDeck =
        (await archiveFlashcardSet(id)) || (await getFlashcardSetById(id));
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
