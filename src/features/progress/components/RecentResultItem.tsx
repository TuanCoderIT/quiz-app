import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { ProgressResult } from "../types";
import { formatCompletedDate } from "../utils";

type RecentResultItemProps = {
  result: ProgressResult;
};

const getScoreTone = (percentage: number) => {
  if (percentage >= 80) {
    return {
      bg: "bg-success/10",
      text: "text-success",
      icon: "trending-up" as const,
      iconColor: "#10B981",
    };
  }

  if (percentage >= 60) {
    return {
      bg: "bg-warning/10",
      text: "text-warning",
      icon: "remove-circle" as const,
      iconColor: "#F59E0B",
    };
  }

  return {
    bg: "bg-error/10",
    text: "text-error",
    icon: "trending-down" as const,
    iconColor: "#EF4444",
  };
};

export const RecentResultItem = ({ result }: RecentResultItemProps) => {
  const tone = getScoreTone(result.percentage);

  return (
    <View className="bg-white rounded-3xl border border-gray-100 p-5 mb-4">
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-1 pr-4">
          <Text className="text-text-primary text-base font-bold mb-1" numberOfLines={2}>
            {result.exam?.title || `Quiz #${result.examId}`}
          </Text>
          <Text className="text-text-secondary text-xs">
            {formatCompletedDate(result.completedAt)}
          </Text>
        </View>

        <View className={`px-3 py-2 rounded-2xl flex-row items-center ${tone.bg}`}>
          <Ionicons name={tone.icon} size={15} color={tone.iconColor} />
          <Text className={`font-bold text-sm ml-1 ${tone.text}`}>
            {result.percentage}%
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-text-secondary text-sm">
          Đúng {result.score}/{result.total} câu
        </Text>
        {result.exam?.difficulty ? (
          <Text className="text-text-secondary text-sm">{result.exam.difficulty}</Text>
        ) : null}
      </View>
    </View>
  );
};
