import { axiosAPI } from "../../services/api/client";
import { PaginatedResponse } from "./common.types";
import {
  CreatePostRequest,
  Post,
  ReactionType,
  UpdatePostRequest,
} from "./post.types";

export async function getGroupPosts(
  groupId: number,
  page = 1
): Promise<PaginatedResponse<Post>> {
  const response = await axiosAPI.get(`/posts/group/${groupId}`, {
    params: { page },
  });

  return response.data;
}

export async function createPost(
  data: CreatePostRequest
): Promise<{ message: string; data: Post }> {
  const response = await axiosAPI.post("/posts", data);
  return response.data;
}

export async function updatePost(
  postId: number,
  data: UpdatePostRequest
): Promise<{ message: string; data: Post }> {
  const response = await axiosAPI.put(`/posts/${postId}`, data);
  return response.data;
}

export async function deletePost(postId: number) {
  const response = await axiosAPI.delete(`/posts/${postId}`);
  return response.data;
}

export async function reactToPost(postId: number, reactionType: ReactionType) {
  const response = await axiosAPI.post(`/posts/${postId}/react`, {
    reaction_type: reactionType,
  });

  return response.data;
}

export async function removePostReaction(postId: number) {
  const response = await axiosAPI.delete(`/posts/${postId}/react`);
  return response.data;
}