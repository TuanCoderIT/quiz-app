import { axiosAPI } from "../../services/api/client";
import { PaginatedResponse } from "./common.types";
import {
  CreateGroupRequest,
  Group,
  GroupDetail,
  GroupJoinRequest,
  GroupMember,
  MembershipStatus,
  UpdateGroupRequest,
} from "./group.types";

export async function getGroups(params?: {
  page?: number;
  search?: string;
  visibility?: "public" | "private";
  sort_by?: "latest" | "members" | "oldest";
  per_page?: number;
}): Promise<PaginatedResponse<Group>> {
  const response = await axiosAPI.get("/groups", { params });
  return response.data;
}

export async function getMyGroups(): Promise<Group[]> {
  const response = await axiosAPI.get("/groups/my-groups");
  return response.data;
}

export async function createGroup(
  data: CreateGroupRequest | FormData
): Promise<{ message: string; data: Group }> {
  const response = await axiosAPI.post("/groups", data, {
    headers:
      data instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
  });

  return response.data;
}

export async function getGroupDetail(slug: string): Promise<GroupDetail> {
  const response = await axiosAPI.get(`/groups/${slug}`);
  return response.data;
}

export async function checkMembership(
  groupId: number
): Promise<MembershipStatus> {
  const response = await axiosAPI.get(`/groups/${groupId}/check-membership`);
  return response.data;
}

export async function getMembers(
  groupId: number,
  params?: {
    role?: "owner" | "admin" | "member";
    search?: string;
  }
): Promise<GroupMember[]> {
  const response = await axiosAPI.get(`/groups/${groupId}/members`, {
    params,
  });

  return response.data;
}

export async function updateGroup(
  groupId: number,
  data: UpdateGroupRequest | FormData
) {
  const response = await axiosAPI.put(`/groups/${groupId}`, data, {
    headers:
      data instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
  });

  return response.data;
}

export async function deleteGroup(groupId: number) {
  const response = await axiosAPI.delete(`/groups/${groupId}`);
  return response.data;
}

export async function joinGroup(groupId: number) {
  const response = await axiosAPI.post(`/groups/${groupId}/join`);
  return response.data;
}

export async function leaveGroup(groupId: number) {
  const response = await axiosAPI.post(`/groups/${groupId}/leave`);
  return response.data;
}

export async function kickMember(groupId: number, userId: number) {
  const response = await axiosAPI.post(`/groups/${groupId}/kick/${userId}`);
  return response.data;
}

export async function promoteMember(groupId: number, userId: number) {
  const response = await axiosAPI.post(`/groups/${groupId}/promote/${userId}`);
  return response.data;
}

export async function demoteMember(groupId: number, userId: number) {
  const response = await axiosAPI.post(`/groups/${groupId}/demote/${userId}`);
  return response.data;
}

export async function getJoinRequests(
  groupId: number
): Promise<GroupJoinRequest[]> {
  const response = await axiosAPI.get(`/groups/${groupId}/join-requests`);
  return response.data;
}

export async function approveRequest(requestId: number) {
  const response = await axiosAPI.post(
    `/groups/join-request/${requestId}/approve`
  );

  return response.data;
}

export async function rejectRequest(requestId: number) {
  const response = await axiosAPI.post(
    `/groups/join-request/${requestId}/reject`
  );

  return response.data;
}