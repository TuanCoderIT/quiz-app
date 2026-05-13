import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { ProgressMetric } from "../types";

type ProgressMetricCardProps = {
  metric: ProgressMetric;
};

export const ProgressMetricCard = ({ metric }: ProgressMetricCardProps) => {
  return (
    <View className="bg-white rounded-3xl border border-gray-100 p-5 flex-1 min-h-[156px]">
      <View
        className="w-11 h-11 rounded-2xl items-center justify-center mb-5"
        style={{ backgroundColor: `${metric.color}15` }}
      >
        <Ionicons name={metric.icon} size={22} color={metric.color} />
      </View>

      <Text className="text-text-primary text-3xl font-bold mb-1">
        {metric.value}
      </Text>
      <Text className="text-text-primary text-sm font-bold mb-1">
        {metric.label}
      </Text>
      <Text className="text-text-secondary text-xs leading-4">
        {metric.caption}
      </Text>
    </View>
  );
};
