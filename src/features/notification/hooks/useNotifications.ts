// src/features/notification/hooks/useNotifications.ts

import { useEffect } from "react";
import { useNotificationStore } from "../store";

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    pagination,

    isLoading,
    isRefreshing,
    isLoadingMore,
    error,

    fetchNotifications,
    refreshNotifications,
    fetchUnreadCount,

    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications({
      page: 1,
      per_page: 15,
    });

    fetchUnreadCount();
  }, []);

  const loadMore = () => {
    if (isLoadingMore) return;
    if (!pagination?.has_more) return;

    fetchNotifications({
      page: pagination.current_page + 1,
      per_page: pagination.per_page,
      append: true,
    });
  };

  return {
    notifications,
    unreadCount,
    pagination,

    isLoading,
    isRefreshing,
    isLoadingMore,
    error,

    refreshNotifications,
    loadMore,

    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearRead,
  };
}