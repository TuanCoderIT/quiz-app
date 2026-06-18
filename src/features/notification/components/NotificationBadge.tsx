// src/features/notification/components/NotificationBadge.tsx

import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
      <View
        className={
          size === "sm"
            ? "h-10 w-10 rounded-full bg-white/85 border border-slate-200 items-center justify-center"
            : "h-12 w-12 rounded-full bg-white/85 border border-slate-200 items-center justify-center"
        }
      >
        <Ionicons
          name="notifications-outline"
          size={size === "sm" ? 21 : 24}
          color="#4F46E5"
        />
      </View>

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
