import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useGamificationStore } from "../store";

/**
 * Compact 3-pill gamification banner.
 * Fetches from /api/me/gamification-summary on mount.
 * Does NOT touch the user auth store.
 */
export const GamificationBanner: React.FC = () => {
  const router = useRouter();
  const { summary, isSummaryLoading, fetchSummary } = useGamificationStore();

  useEffect(() => {
    fetchSummary();
  }, []);

  if (isSummaryLoading && !summary) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#4F46E5" />
      </View>
    );
  }

  if (!summary) return null;

  return (
    <View style={styles.container}>
      {/* Level + XP */}
      <View style={styles.pill}>
        <Ionicons name="star" size={14} color="#F59E0B" />
        <View style={styles.pillText}>
          <Text style={styles.pillValue}>Lv.{summary.level}</Text>
          <Text style={styles.pillSub}>
            {summary.xp.toLocaleString("vi-VN")} XP
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Streak */}
      <View style={styles.pill}>
        <Ionicons name="flame" size={14} color="#EF4444" />
        <View style={styles.pillText}>
          <Text style={styles.pillValue}>{summary.current_streak} ngày</Text>
          <Text style={styles.pillSub}>Streak</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Achievements — tappable */}
      <Pressable
        style={styles.pill}
        onPress={() => router.push("../achievements")}
        android_ripple={{ color: "#E0E7FF", radius: 40 }}
      >
        <Ionicons name="trophy" size={14} color="#7C3AED" />
        <View style={styles.pillText}>
          <Text style={[styles.pillValue, styles.tappable]}>
            {summary.achievements_unlocked}/{summary.achievements_total}
          </Text>
          <Text style={styles.pillSub}>Thành tích</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={12}
          color="#94A3B8"
          style={styles.chevron}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 60,
    justifyContent: "space-around",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },
  pillText: {
    gap: 1,
  },
  pillValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  pillSub: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
  },
  tappable: {
    color: "#4F46E5",
  },
  chevron: {
    marginLeft: 2,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: "#E2E8F0",
  },
});
