// src/features/notification/components/NotificationBadge.tsx

import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useNotificationStore } from "../store";

type Props = {
  size?: "sm" | "md";
};

export function NotificationBadge({ size = "md" }: Props) {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <TouchableOpacity
      onPress={() => router.push("/notifications")}
      className="relative items-center justify-center"
      activeOpacity={0.8}
    >
      <Text className={size === "sm" ? "text-2xl" : "text-3xl"}>🔔</Text>

      {unreadCount > 0 && (
        <View className="absolute -right-2 -top-1 min-w-[20px] h-5 rounded-full bg-red-500 items-center justify-center px-1">
          <Text className="text-white text-xs font-bold">
            {badgeText}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}