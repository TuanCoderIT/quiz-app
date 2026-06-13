import { axiosAPI } from "../../services/api/client";
import { GamificationSummary, UserAchievementItem } from "./types";

type ApiResponse<T> = T | { data?: T };

const unwrap = <T>(payload: ApiResponse<T>): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as object) &&
    (payload as { data?: T }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export const getGamificationSummary =
  async (): Promise<GamificationSummary> => {
    const res = await axiosAPI.get<ApiResponse<GamificationSummary>>(
      "/me/gamification-summary",
    );
    return unwrap(res.data);
  };

export const getAchievements = async (): Promise<UserAchievementItem[]> => {
  const res =
    await axiosAPI.get<ApiResponse<UserAchievementItem[]>>("/me/achievements");
  const data = unwrap(res.data);
  return Array.isArray(data) ? data : [];
};
