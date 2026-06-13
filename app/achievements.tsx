import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGamificationStore } from "../src/features/gamification/store";
import {
  AchievementRarity,
  UserAchievementItem,
} from "../src/features/gamification/types";
import { getAchievementIcon } from "../src/utils/iconMap";

// ─── Rarity helpers ───────────────────────────────────────────────────────────

const RARITY_CONFIG: Record<
  AchievementRarity,
  { label: string; color: string; bg: string }
> = {
  common: { label: "Thường", color: "#64748B", bg: "#F1F5F9" },
  rare: { label: "Hiếm", color: "#3B82F6", bg: "#EFF6FF" },
  epic: { label: "Sử thi", color: "#7C3AED", bg: "#F5F3FF" },
  legendary: { label: "Huyền thoại", color: "#F59E0B", bg: "#FFFBEB" },
};

const ICON_COLOR: Record<AchievementRarity, string> = {
  common: "#64748B",
  rare: "#3B82F6",
  epic: "#7C3AED",
  legendary: "#F59E0B",
};

// ─── Unlocked Item ────────────────────────────────────────────────────────────

const UnlockedItem = React.memo(function UnlockedItem({
  item,
  index,
}: {
  item: UserAchievementItem;
  index: number;
}) {
  const rarity = RARITY_CONFIG[item.rarity] ?? RARITY_CONFIG.common;
  const iconColor = ICON_COLOR[item.rarity] ?? "#64748B";
  const iconName = getAchievementIcon(item.icon);

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 40).duration(400)}
      style={styles.card}
    >
      {/* Icon */}
      <View style={[styles.iconCircle, { backgroundColor: `${iconColor}1A` }]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>

      {/* Text block */}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name}
        </Text>
        {!!item.description && (
          <Text style={styles.cardDesc} numberOfLines={1}>
            {item.description}
          </Text>
        )}
        <View style={styles.cardMeta}>
          <View style={[styles.rarityBadge, { backgroundColor: rarity.bg }]}>
            <Text style={[styles.rarityText, { color: rarity.color }]}>
              {rarity.label}
            </Text>
          </View>
        </View>
      </View>

      {/* XP */}
      <View style={styles.xpChip}>
        <Ionicons name="sparkles" size={11} color="#7C3AED" />
        <Text style={styles.xpText}>+{item.xp_reward}</Text>
      </View>
    </Animated.View>
  );
});

// ─── Locked Item ──────────────────────────────────────────────────────────────

const LockedItem = React.memo(function LockedItem({
  item,
  index,
}: {
  item: UserAchievementItem;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 30).duration(400)}
      style={[styles.card, styles.cardLocked]}
    >
      {/* Lock icon */}
      <View style={styles.lockCircle}>
        <Ionicons name="lock-closed" size={18} color="#94A3B8" />
      </View>

      {/* Text */}
      <View style={styles.cardBody}>
        <Text style={styles.cardNameLocked} numberOfLines={1}>
          {item.name}
        </Text>
        {!!item.description && (
          <Text style={styles.cardDescLocked} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>

      {/* XP (dimmed) */}
      <View style={styles.xpChipLocked}>
        <Text style={styles.xpTextLocked}>+{item.xp_reward}</Text>
      </View>
    </Animated.View>
  );
});

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, count }: { title: string; count: number }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBadge}>
      <Text style={styles.sectionBadgeText}>{count}</Text>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

type ListItem =
  | { kind: "header-unlocked"; count: number }
  | { kind: "header-locked"; count: number }
  | { kind: "unlocked"; item: UserAchievementItem; index: number }
  | { kind: "locked"; item: UserAchievementItem; index: number }
  | { kind: "empty-unlocked" }
  | { kind: "empty-locked" };

export default function AchievementsScreen() {
  const router = useRouter();
  const { achievements, isAchievementsLoading, fetchAchievements } =
    useGamificationStore();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  const listData: ListItem[] = [
    { kind: "header-unlocked", count: unlocked.length },
    ...(unlocked.length > 0
      ? unlocked.map((item, index) => ({
          kind: "unlocked" as const,
          item,
          index,
        }))
      : [{ kind: "empty-unlocked" as const }]),
    { kind: "header-locked", count: locked.length },
    ...(locked.length > 0
      ? locked.map((item, index) => ({
          kind: "locked" as const,
          item,
          index,
        }))
      : [{ kind: "empty-locked" as const }]),
  ];

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    switch (item.kind) {
      case "header-unlocked":
        return <SectionHeader title="🏆 Đã mở khoá" count={item.count} />;
      case "header-locked":
        return <SectionHeader title="🔒 Chưa mở khoá" count={item.count} />;
      case "unlocked":
        return <UnlockedItem item={item.item} index={item.index} />;
      case "locked":
        return <LockedItem item={item.item} index={item.index} />;
      case "empty-unlocked":
        return (
          <Text style={styles.emptyText}>
            Chưa có thành tích nào được mở khoá.
          </Text>
        );
      case "empty-locked":
        return (
          <Text style={styles.emptyText}>
            Bạn đã mở khoá tất cả thành tích! 🎉
          </Text>
        );
    }
  }, []);

  const keyExtractor = useCallback((_: ListItem, i: number) => String(i), []);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Thành tích</Text>
        <View style={{ width: 34 }} />
      </View>

      {isAchievementsLoading && achievements.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Đang tải thành tích...</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionBadge: {
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  // ─ Cards ─
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  cardLocked: {
    opacity: 0.55,
    backgroundColor: "#F8FAFC",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  lockCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardNameLocked: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  cardDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
  cardDescLocked: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 16,
  },
  cardMeta: {
    flexDirection: "row",
    marginTop: 4,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: "700",
  },
  xpChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
  },
  xpText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#7C3AED",
  },
  xpChipLocked: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
  },
  xpTextLocked: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
  },
  // ─ States ─
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    paddingVertical: 16,
  },
});
