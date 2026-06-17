// src/features/notification/api.ts

import { axiosAPI } from "@/src/services/api/client";
import {
  ClearReadResponse,
  NotificationDetailResponse,
  NotificationListResponse,
  MarkAllAsReadResponse,
  UnreadCountResponse,
  UnreadNotificationsResponse,
} from "./types";

export const notificationApi = {
  getNotifications: async (params?: {
    page?: number;
    per_page?: number;
    type?: string;
  }) => {
    const res = await axiosAPI.get<NotificationListResponse>("/notifications", {
      params,
    });

    return res.data;
  },

  getUnreadCount: async () => {
    const res = await axiosAPI.get<UnreadCountResponse>(
      "/notifications/unread-count"
    );

    return res.data;
  },

  getUnreadNotifications: async (limit = 10) => {
    const res = await axiosAPI.get<UnreadNotificationsResponse>(
      "/notifications/unread",
      {
        params: {
          limit,
        },
      }
    );

    return res.data;
  },

  getNotificationDetail: async (id: number) => {
    const res = await axiosAPI.get<NotificationDetailResponse>(
      `/notifications/${id}`
    );

    return res.data;
  },

  markAsRead: async (id: number) => {
    const res = await axiosAPI.patch<NotificationDetailResponse>(
      `/notifications/${id}/read`
    );

    return res.data;
  },

  markAllAsRead: async () => {
    const res = await axiosAPI.patch<MarkAllAsReadResponse>(
      "/notifications/read-all"
    );

    return res.data;
  },

  deleteNotification: async (id: number) => {
    const res = await axiosAPI.delete(`/notifications/${id}`);

    return res.data;
  },

  clearRead: async () => {
    const res = await axiosAPI.delete<ClearReadResponse>(
      "/notifications/clear-read"
    );

    return res.data;
  },
};