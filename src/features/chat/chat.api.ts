import { axiosAPI } from "@/src/services/api/client";
import {
  ChatMessage,
  ChatThread,
  MessagesQueryParams,
  PaginatedResponse,
  SendMessageRequest,
} from "./chat.types";

export async function getThreads(): Promise<ChatThread[]> {
  const response = await axiosAPI.get("/chat/threads");
  return response.data;
}

export async function getGroupThread(groupId: number): Promise<ChatThread> {
  const response = await axiosAPI.get(`/chat/threads/group/${groupId}`);
  return response.data;
}

export async function getMessages(
  threadId: number,
  params?: MessagesQueryParams
): Promise<PaginatedResponse<ChatMessage>> {
  const response = await axiosAPI.get(`/chat/threads/${threadId}/messages`, {
    params,
  });

  return response.data;
}

export async function sendMessage(
  threadId: number,
  payload: SendMessageRequest
): Promise<ChatMessage> {
  const response = await axiosAPI.post(
    `/chat/threads/${threadId}/messages`,
    payload
  );

  return response.data;
}

export async function markAsRead(threadId: number): Promise<void> {
  await axiosAPI.post(`/chat/threads/${threadId}/read`);
}

export async function sendTyping(threadId: number): Promise<void> {
  await axiosAPI.post(`/chat/threads/${threadId}/typing`);
}