import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Group } from "../group.types";
import { getImageUrl } from "@/src/utils/image";

interface GroupCardProps {
  group: Group;
  onPress: () => void;
}

export default function GroupCard({ group, onPress }: GroupCardProps) {
  const imageUrl = getImageUrl(group.cover_image);
  // console.log("Group cover raw:", group.cover_image);
  // console.log("Group cover URL:", imageUrl);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
      className="mb-3 overflow-hidden rounded-xl bg-surface"
    >
      {/* Cover Image */}
      <View className="h-32 w-full bg-primary/10">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Ionicons name="people" size={36} color="#4F46E5" opacity={0.35} />
          </View>
        )}
        {/* Visibility badge */}
        <View
          className={`absolute right-3 top-3 flex-row items-center gap-1 rounded-full px-2 py-0.5 ${
            group.visibility === "private"
              ? "bg-black/40"
              : "bg-black/25"
          }`}
        >
          <Ionicons
            name={group.visibility === "private" ? "lock-closed" : "earth"}
            size={10}
            color="white"
          />
          <Text className="text-xs font-medium text-white">
            {group.visibility === "private" ? "Riêng tư" : "Công khai"}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View className="px-4 py-3">
        <Text className="text-base font-semibold text-text-primary" numberOfLines={1}>
          {group.name}
        </Text>
        {group.description && (
          <Text className="mt-0.5 text-sm leading-5 text-text-secondary" numberOfLines={2}>
            {group.description}
          </Text>
        )}
        <View className="mt-2 flex-row items-center gap-1">
          <Ionicons name="people-outline" size={14} color="#6B7280" />
          <Text className="text-xs text-text-secondary">
            {group.members_count.toLocaleString()} thành viên
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
});