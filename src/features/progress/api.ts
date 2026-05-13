import { axiosAPI } from "../../services/api/client";
import { ProgressResult } from "./types";

type ApiResultExam = {
  id?: number;
  title?: string;
  category?: string | { name?: string };
  difficulty?: string;
};

type ApiResult = {
  id?: number;
  exam_id?: number;
  examId?: number;
  score?: number | string;
  total?: number | string;
  percentage?: number | string;
  time_spent?: number | string;
  completed_at?: string;
  created_at?: string;
  exam?: ApiResultExam;
};

type ResultsResponse =
  | ApiResult[]
  | {
      data?: ApiResult[] | { data?: ApiResult[] };
      results?: ApiResult[];
    };

const unwrapResults = (payload: ResultsResponse): ApiResult[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.data && "data" in payload.data && Array.isArray(payload.data.data)) {
    return payload.data.data;
  }

  return [];
};

const toNumber = (value: number | string | undefined, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const normalizeCategory = (category?: ApiResultExam["category"]) => {
  if (!category) {
    return undefined;
  }

  return typeof category === "string" ? category : category.name;
};

const normalizeResult = (result: ApiResult): ProgressResult => {
  const score = toNumber(result.score);
  const total = toNumber(result.total);
  const fallbackPercentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return {
    id: toNumber(result.id),
    examId: toNumber(result.exam_id ?? result.examId),
    score,
    total,
    percentage: toNumber(result.percentage, fallbackPercentage),
    timeSpent: toNumber(result.time_spent),
    completedAt: result.completed_at || result.created_at || new Date(0).toISOString(),
    exam: result.exam
      ? {
          id: toNumber(result.exam.id),
          title: result.exam.title || "Quiz",
          category: normalizeCategory(result.exam.category),
          difficulty: result.exam.difficulty,
        }
      : undefined,
  };
};

export const getProgressResults = async (): Promise<ProgressResult[]> => {
  const response = await axiosAPI.get<ResultsResponse>("/results");
  return unwrapResults(response.data).map(normalizeResult);
};
