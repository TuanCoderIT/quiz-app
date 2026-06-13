import { create } from "zustand";
import { getAchievements, getGamificationSummary } from "./api";
import { GamificationSummary, UserAchievementItem } from "./types";

interface GamificationState {
  summary: GamificationSummary | null;
  achievements: UserAchievementItem[];
  pendingAchievements: UserAchievementItem[]; // popup queue
  isSummaryLoading: boolean;
  isAchievementsLoading: boolean;

  fetchSummary: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  enqueueAchievements: (items: UserAchievementItem[]) => void;
  dismissTopAchievement: () => void;
  /** Call after every learning action — refreshes summary + queues popups */
  refreshAfterAction: (unlockedAchievements: UserAchievementItem[]) => void;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  summary: null,
  achievements: [],
  pendingAchievements: [],
  isSummaryLoading: false,
  isAchievementsLoading: false,

  fetchSummary: async () => {
    set({ isSummaryLoading: true });
    try {
      const summary = await getGamificationSummary();
      set({ summary });
    } catch (err) {
      console.warn("[Gamification] fetchSummary error:", err);
    } finally {
      set({ isSummaryLoading: false });
    }
  },

  fetchAchievements: async () => {
    set({ isAchievementsLoading: true });
    try {
      const achievements = await getAchievements();
      set({ achievements });
    } catch (err) {
      console.warn("[Gamification] fetchAchievements error:", err);
    } finally {
      set({ isAchievementsLoading: false });
    }
  },

  enqueueAchievements: (items) => {
    if (!items.length) return;
    set((state) => ({
      pendingAchievements: [...state.pendingAchievements, ...items],
    }));
  },

  dismissTopAchievement: () => {
    set((state) => ({
      pendingAchievements: state.pendingAchievements.slice(1),
    }));
  },

  refreshAfterAction: (unlockedAchievements) => {
    // Refresh summary in background (don't await — fire & forget)
    get().fetchSummary();

    // Queue achievement popups if any
    if (unlockedAchievements.length > 0) {
      get().enqueueAchievements(unlockedAchievements);
      // Also refresh achievements list to reflect new unlocks
      get().fetchAchievements();
    }
  },
}));
