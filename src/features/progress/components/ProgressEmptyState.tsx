import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export const ProgressEmptyState = () => {
  return (
    <View className="bg-white rounded-3xl border border-gray-100 p-8 items-center">
      <View className="w-16 h-16 rounded-3xl bg-primary/10 items-center justify-center mb-5">
        <Ionicons name="bar-chart-outline" size={30} color="#4F46E5" />
      </View>
      <Text className="text-text-primary text-lg font-bold text-center mb-2">
        Chưa có dữ liệu tiến độ
      </Text>
      <Text className="text-text-secondary text-sm text-center leading-5">
        Hoàn thành một quiz để xem điểm trung bình, tỷ lệ đúng và streak học tập.
      </Text>
    </View>
  );
};
