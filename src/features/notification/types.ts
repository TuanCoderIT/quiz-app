// src/features/notification/types.ts

export type NotificationType =
  | "new_message"
  | "joined_group"
  | "new_course"
  | "course_completed"
  | "quiz_completed"
  | "ai_quiz_generated"
  | "token_reward"
  | "system_announcement"
  | string;

export type NotificationData = {
  icon?: string | null;
  title?: string;
  message?: string;
  action_url?: string | null;
  extra_data?: Record<string, any>;
};

export type AppNotification = {
  id: number;
  user_id: number;
  type: NotificationType;
  data: NotificationData;

  read_at: string | null;
  created_at: string;
  updated_at: string;

  is_read: boolean;

  // Các field này do Laravel $appends trả về
  title?: string | null;
  message?: string | null;
  icon?: string | null;
  action_url?: string | null;
};

export type NotificationPagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
};

export type NotificationListResponse = {
  message: string;
  data: {
    notifications: AppNotification[];
    pagination: NotificationPagination;
  };
};

export type UnreadCountResponse = {
  message: string;
  data: {
    unread_count: number;
  };
};

export type UnreadNotificationsResponse = {
  message: string;
  data: {
    notifications: AppNotification[];
    count: number;
  };
};

export type NotificationDetailResponse = {
  message: string;
  data: {
    notification: AppNotification;
  };
};

export type MarkAllAsReadResponse = {
  message: string;
  data: {
    updated_count: number;
  };
};

export type ClearReadResponse = {
  message: string;
  data: {
    deleted_count: number;
  };
};