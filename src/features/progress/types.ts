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
  totalStudyTime: number;
  bestScore: number;
  latestResult?: ProgressResult;
};
