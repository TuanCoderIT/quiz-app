import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon = "folder-open-outline",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
        <Ionicons name={icon} size={32} color="#9CA3AF" />
      </View>
      <Text className="text-center text-lg font-semibold text-text-primary">
        {title}
      </Text>
      {description && (
        <Text className="mt-2 text-center text-sm leading-5 text-text-secondary">
          {description}
        </Text>
      )}
      {action && <View className="mt-5">{action}</View>}
    </View>
  );
}