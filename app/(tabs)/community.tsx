import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background px-5" edges={["top"]}>
      <View className="flex-1 items-center justify-center pb-20">
        <View className="mb-5 h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
          <Ionicons name="people-outline" size={36} color="#4F46E5" />
        </View>
        <Text className="text-center text-2xl font-bold text-text-primary">
          Cộng đồng
        </Text>
        <Text className="mt-3 max-w-72 text-center text-base leading-6 text-text-secondary">
          Nhóm học tập và hoạt động cộng đồng sẽ sớm xuất hiện tại đây.
        </Text>
      </View>
    </SafeAreaView>
  );
}
