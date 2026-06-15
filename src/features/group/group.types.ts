import { CommunityUser } from "./common.types";

export interface Group {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  members_count: number;
  posts_count?: number;
  owner_id: number;
  visibility: "public" | "private";
  created_at: string;
  updated_at: string;
  owner?: CommunityUser;
}

export interface GroupDetail extends Group {
  members: GroupMember[];
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  role: "owner" | "admin" | "member";
  user: CommunityUser;
}

export interface GroupJoinRequest {
  id: number;
  group_id: number;
  user_id: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  user: CommunityUser;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  cover_image?: string;
  visibility: "public" | "private";
}

export interface UpdateGroupRequest {
  description?: string;
  cover_image?: string;
  visibility?: "public" | "private";
}

export interface MembershipStatus {
  is_member: boolean;
  role: "owner" | "admin" | "member" | null;
  is_owner: boolean;
  has_pending_request: boolean;
}