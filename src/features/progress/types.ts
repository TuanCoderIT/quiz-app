import { Ionicons } from "@expo/vector-icons";

export type ProgressDifficulty = "Beginner" | "Intermediate" | "Advanced" | string;

export type ProgressResultExam = {
  id: number;
  title: string;
  category?: string;
  difficulty?: ProgressDifficulty;
};

export type ProgressResult = {
  id: number;
  examId: number;
  score: number;
  total: number;
  percentage: number;
  timeSpent?: number;
  completedAt: string;
  exam?: ProgressResultExam;
};

export type ProgressSummary = {
  completedCount: number;
  averageScore: number;
  accuracyRate: number;
  totalCorrect: number;
  totalQuestions: number;
  studyStreak: number;
  bestScore: number;
  latestResult?: ProgressResult;
};

export type ProgressMetric = {
  label: string;
  value: string;
  caption: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};
