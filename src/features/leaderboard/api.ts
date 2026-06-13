import { axiosAPI } from "../../services/api/client";
import { LeaderboardResponse } from "./types";

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  const response = await axiosAPI.get("/leaderboard");
  return response.data;
}