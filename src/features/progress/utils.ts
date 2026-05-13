import { ProgressMetric, ProgressResult, ProgressSummary } from "./types";

const getDateKey = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const calculateStudyStreak = (results: ProgressResult[]) => {
  const completedDays = new Set(
    results.map((result) => getDateKey(result.completedAt)).filter(Boolean)
  );

  if (completedDays.size === 0) {
    return 0;
  }

  const today = new Date();
  const todayKey = getDateKey(today.toISOString());
  const yesterdayKey = getDateKey(addDays(today, -1).toISOString());

  let cursor = completedDays.has(todayKey)
    ? today
    : completedDays.has(yesterdayKey)
      ? addDays(today, -1)
      : null;

  if (!cursor) {
    return 0;
  }

  let streak = 0;

  while (completedDays.has(getDateKey(cursor.toISOString()))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
};

export const sortResultsByDate = (results: ProgressResult[]) => {
  return [...results].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
};

export const calculateProgressSummary = (results: ProgressResult[]): ProgressSummary => {
  const completedResults = results.filter((result) => result.total > 0);
  const completedCount = results.length;
  const totalCorrect = completedResults.reduce((sum, result) => sum + result.score, 0);
  const totalQuestions = completedResults.reduce((sum, result) => sum + result.total, 0);
  const averageScore =
    completedResults.length > 0
      ? Math.round(
          completedResults.reduce((sum, result) => sum + result.percentage, 0) /
            completedResults.length
        )
      : 0;
  const accuracyRate =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const bestScore =
    completedResults.length > 0
      ? Math.max(...completedResults.map((result) => result.percentage))
      : 0;

  return {
    completedCount,
    averageScore,
    accuracyRate,
    totalCorrect,
    totalQuestions,
    studyStreak: calculateStudyStreak(results),
    bestScore,
    latestResult: sortResultsByDate(results)[0],
  };
};

export const buildProgressMetrics = (summary: ProgressSummary): ProgressMetric[] => {
  return [
    {
      label: "Điểm trung bình",
      value: `${summary.averageScore}%`,
      caption: `${summary.completedCount} bài đã làm`,
      icon: "analytics-outline",
      color: "#4F46E5",
    },
    {
      label: "Tỷ lệ đúng",
      value: `${summary.accuracyRate}%`,
      caption: `${summary.totalCorrect}/${summary.totalQuestions} câu`,
      icon: "checkmark-done-outline",
      color: "#10B981",
    },
    {
      label: "Streak học tập",
      value: `${summary.studyStreak}`,
      caption: summary.studyStreak > 0 ? "ngày liên tiếp" : "chưa có streak",
      icon: "flame-outline",
      color: "#F59E0B",
    },
  ];
};

export const formatCompletedDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa rõ thời gian";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};
