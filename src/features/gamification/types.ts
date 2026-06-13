// ─── Gamification Types ──────────────────────────────────────────────────────

export interface GamificationSummary {
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  streak_freezes: number;
  achievements_unlocked: number;
  achievements_total: number;
}

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface UserAchievementItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  rarity: AchievementRarity;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at: string | null;
}

// ─── Response helpers ─────────────────────────────────────────────────────────

/** Attached to learning-action responses when achievements are unlocked */
export interface WithUnlockedAchievements {
  unlocked_achievements?: UserAchievementItem[];
}
