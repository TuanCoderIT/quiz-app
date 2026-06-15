import { axiosAPI } from "@/src/services/api/client";
import { PaginatedResponse } from "./common.types";
import {
  CreatePostRequest,
  Post,
  PostComment,
  ReactionType,
  UpdatePostRequest,
} from "./post.types";

export async function getGroupPosts(
  groupId: number,
  page = 1,
): Promise<PaginatedResponse<Post>> {
  const response = await axiosAPI.get(`/posts/group/${groupId}`, {
    params: { page },
  });

  return response.data;
}

export async function getPost(postId: number): Promise<Post> {
  const response = await axiosAPI.get(`/posts/${postId}`);
  return response.data;
}

export async function createPost(
  data: CreatePostRequest,
): Promise<{ message: string; data: Post }> {
  const response = await axiosAPI.post("/posts", data);
  return response.data;
}

export async function updatePost(
  postId: number,
  data: UpdatePostRequest,
): Promise<{ message: string; data: Post }> {
  const response = await axiosAPI.put(`/posts/${postId}`, data);
  return response.data;
}

export async function deletePost(postId: number) {
  const response = await axiosAPI.delete(`/posts/${postId}`);
  return response.data;
}

export async function reactToPost(postId: number, reactionType: ReactionType) {
  const response = await axiosAPI.post("/reactions", {
    target_type: "post",
    target_id: postId,
    reaction_type: reactionType,
  });

  return response.data;
}

export async function removePostReaction(postId: number) {
  const response = await axiosAPI.delete("/reactions", {
    data: {
      target_type: "post",
      target_id: postId,
    },
  });
  return response.data;
}

export async function getPostComments(postId: number): Promise<PostComment[]> {
  const response = await axiosAPI.get(`/posts/${postId}/comments`);
  const payload = response.data?.data ?? response.data;

  return Array.isArray(payload) ? payload : (payload?.data ?? []);
}

export async function createPostComment(
  postId: number,
  content: string,
): Promise<PostComment> {
  const response = await axiosAPI.post(`/posts/${postId}/comments`, {
    content,
  });
  return response.data?.data ?? response.data;
}
