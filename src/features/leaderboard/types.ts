export type LeaderboardUser = {
  rank: number;
  id: number;
  name: string;
  avatar?: string | null;
  xp: number;
  isCurrentUser: boolean;
};

export type CurrentUserRank = {
  rank: number;
  id: number;
  name: string;
  avatar?: string | null;
  xp: number;
};

export type LeaderboardResponse = {
  data: LeaderboardUser[];
  me: CurrentUserRank;
};