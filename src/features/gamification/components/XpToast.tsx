import React from "react";
import { Text, View } from "react-native";

export const XpToast = ({ label }: { label?: string | null }) => {
  if (!label) {
    return null;
  }

  return (
    <View className="absolute left-0 right-0 top-14 z-50 items-center px-5">
      <View className="rounded-full bg-slate-950/90 px-5 py-3 shadow-lg">
        <Text className="text-white text-sm font-extrabold">{label}</Text>
      </View>
    </View>
  );
};
