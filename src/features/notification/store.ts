// src/features/notification/store.ts

import { create } from "zustand";
import { notificationApi } from "./api";
import { AppNotification, NotificationPagination } from "./types";

type NotificationState = {
  notifications: AppNotification[];
  unreadCount: number;
  pagination: NotificationPagination | null;

  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;

  fetchNotifications: (params?: {
    page?: number;
    per_page?: number;
    type?: string;
    append?: boolean;
  }) => Promise<void>;

  refreshNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;

  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;

  deleteNotification: (id: number) => Promise<void>;
  clearRead: () => Promise<void>;

  addRealtimeNotification: (payload: {
    notification: AppNotification;
    unread_count: number;
  }) => void;

  reset: () => void;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pagination: null,

  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  error: null,

  fetchNotifications: async (params) => {
    const page = params?.page ?? 1;
    const append = params?.append ?? false;

    try {
      if (append) {
        set({ isLoadingMore: true, error: null });
      } else {
        set({ isLoading: true, error: null });
      }

      const response = await notificationApi.getNotifications({
        page,
        per_page: params?.per_page ?? 15,
        type: params?.type,
      });

      const newNotifications = response.data.notifications;

      set((state) => ({
        notifications: append
          ? [...state.notifications, ...newNotifications]
          : newNotifications,
        pagination: response.data.pagination,
        isLoading: false,
        isLoadingMore: false,
      }));
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải thông báo",
        isLoading: false,
        isLoadingMore: false,
      });
    }
  },

  refreshNotifications: async () => {
    try {
      set({ isRefreshing: true, error: null });

      const response = await notificationApi.getNotifications({
        page: 1,
        per_page: 15,
      });

      const countResponse = await notificationApi.getUnreadCount();

      set({
        notifications: response.data.notifications,
        pagination: response.data.pagination,
        unreadCount: countResponse.data.unread_count,
        isRefreshing: false,
      });
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể làm mới thông báo",
        isRefreshing: false,
      });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationApi.getUnreadCount();

      set({
        unreadCount: response.data.unread_count,
      });
    } catch {
      // Không cần báo lỗi mạnh cho badge
    }
  },

  markAsRead: async (id) => {
    const current = get().notifications.find((item) => item.id === id);

    try {
      const response = await notificationApi.markAsRead(id);
      const updatedNotification = response.data.notification;

      set((state) => ({
        notifications: state.notifications.map((item) =>
          item.id === id ? updatedNotification : item,
        ),
        unreadCount:
          current && !current.is_read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      }));
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể đánh dấu đã đọc",
      });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();

      set((state) => ({
        notifications: state.notifications.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at ?? new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể đánh dấu tất cả đã đọc",
      });
    }
  },

  deleteNotification: async (id) => {
    const current = get().notifications.find((item) => item.id === id);

    try {
      await notificationApi.deleteNotification(id);

      set((state) => ({
        notifications: state.notifications.filter((item) => item.id !== id),
        unreadCount:
          current && !current.is_read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      }));
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể xóa thông báo",
      });
    }
  },

  clearRead: async () => {
    try {
      await notificationApi.clearRead();

      set((state) => ({
        notifications: state.notifications.filter((item) => !item.is_read),
      }));
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể xóa thông báo đã đọc",
      });
    }
  },

  addRealtimeNotification: ({ notification, unread_count }) => {
    set((state) => {
      const exists = state.notifications.some(
        (item) => item.id === notification.id,
      );

      return {
        notifications: exists
          ? state.notifications
          : [notification, ...state.notifications],
        unreadCount: unread_count,
      };
    });
  },

  reset: () => {
    set({
      notifications: [],
      unreadCount: 0,
      pagination: null,
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      error: null,
    });
  },
}));
