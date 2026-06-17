// src/features/notification/components/NotificationItem.tsx

import { Text, TouchableOpacity, View } from "react-native";
import { AppNotification } from "../types";

type Props = {
  notification: AppNotification;
  onPress?: (notification: AppNotification) => void;
  onDelete?: (notification: AppNotification) => void;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function NotificationItem({
  notification,
  onPress,
  onDelete,
}: Props) {
  const title = notification.title || notification.data?.title || "Thông báo";
  const message =
    notification.message || notification.data?.message || "";
  const icon = notification.icon || notification.data?.icon || "🔔";

  return (
    <TouchableOpacity
      onPress={() => onPress?.(notification)}
      activeOpacity={0.8}
      className={`mx-4 mb-3 rounded-2xl border p-4 ${
        notification.is_read
          ? "bg-white border-gray-100"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <View className="flex-row">
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-white">
          <Text className="text-2xl">{icon}</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <Text
              className={`flex-1 text-base ${
                notification.is_read
                  ? "font-medium text-gray-800"
                  : "font-bold text-gray-900"
              }`}
              numberOfLines={1}
            >
              {title}
            </Text>

            {!notification.is_read && (
              <View className="ml-2 mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
            )}
          </View>

          <Text
            className="mt-1 text-sm text-gray-600"
            numberOfLines={2}
          >
            {message}
          </Text>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-xs text-gray-400">
              {formatDate(notification.created_at)}
            </Text>

            {onDelete && (
              <TouchableOpacity
                onPress={() => onDelete(notification)}
                hitSlop={8}
              >
                <Text className="text-xs text-red-500">Xóa</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}