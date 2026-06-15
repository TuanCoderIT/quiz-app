import { CommunityUser } from "./common.types";

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface ReactionSummary {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface Post {
  id: number;
  user_id: number;
  content: string | null;
  attachments: string[] | null;
  group_id: number | null;
  is_pinned: boolean;
  is_hidden?: boolean;
  visibility: "public" | "private" | "group_only";
  created_at: string;
  updated_at: string;
  user: CommunityUser;
  comments_count: number;
  reactions_count: number;
  user_reaction: ReactionType | null;
  reaction_summary: ReactionSummary;
  reactions?: {
    id: number;
    user_id: number;
    reaction_type: ReactionType | string;
  }[];
}

export interface CreatePostRequest {
  content?: string;
  attachments?: string[];
  group_id: number;
  visibility?: "public" | "private" | "group_only";
}

export interface UpdatePostRequest {
  content?: string;
  attachments?: string[];
  visibility?: "public" | "private" | "group_only";
}

export interface PostComment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  user: CommunityUser;
}
