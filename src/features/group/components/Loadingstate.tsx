import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator size="large" color="#4F46E5" />
      {message && (
        <Text className="mt-3 text-sm text-text-secondary">{message}</Text>
      )}
    </View>
  );
}