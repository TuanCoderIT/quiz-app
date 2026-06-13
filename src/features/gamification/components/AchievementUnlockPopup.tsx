import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { getAchievementIcon } from "../../../utils/iconMap";
import { useGamificationStore } from "../store";
import { AchievementRarity, UserAchievementItem } from "../types";

// ─── Rarity config ───────────────────────────────────────────────────────────

const RARITY_CONFIG: Record<
  AchievementRarity,
  { label: string; color: string; bg: string; border: string }
> = {
  common: {
    label: "Thường",
    color: "#64748B",
    bg: "#F1F5F9",
    border: "#CBD5E1",
  },
  rare: { label: "Hiếm", color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  epic: { label: "Sử thi", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  legendary: {
    label: "Huyền thoại",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
};

const ICON_BG: Record<AchievementRarity, string> = {
  common: "#64748B",
  rare: "#3B82F6",
  epic: "#7C3AED",
  legendary: "#F59E0B",
};

const AUTO_DISMISS_MS = 4000;

// ─── Inner card (animates in) ─────────────────────────────────────────────────

const PopupCard = ({
  achievement,
  onDismiss,
}: {
  achievement: UserAchievementItem;
  onDismiss: () => void;
}) => {
  const scale = useSharedValue(0.75);
  const opacity = useSharedValue(0);

  const rarity = RARITY_CONFIG[achievement.rarity] ?? RARITY_CONFIG.common;
  const iconName = getAchievementIcon(achievement.icon);
  const isStreak =
    achievement.icon === "flame" || achievement.code?.includes("streak");

  // Animate in on mount
  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 250 });

    const timer = setTimeout(() => {
      // Animate out then dismiss
      opacity.value = withTiming(0, { duration: 250 }, (finished) => {
        if (finished) runOnJS(onDismiss)();
      });
      scale.value = withTiming(0.85, { duration: 250 });
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [achievement.id]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleClose = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) runOnJS(onDismiss)();
    });
    scale.value = withTiming(0.85, { duration: 200 });
  }, [onDismiss]);

  return (
    <Animated.View style={[styles.card, animStyle]}>
      {/* Close button */}
      <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={12}>
        <Ionicons name="close" size={18} color="#94A3B8" />
      </Pressable>

      {/* Header label */}
      <Text style={styles.headerLabel}>
        {isStreak ? "🔥 Streak Achievement!" : "🏆 Achievement Unlocked!"}
      </Text>

      {/* Icon circle */}
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: ICON_BG[achievement.rarity] },
        ]}
      >
        <Ionicons name={iconName} size={36} color="#FFFFFF" />
      </View>

      {/* Name */}
      <Text style={styles.name} numberOfLines={2}>
        {achievement.name}
      </Text>

      {/* Description */}
      {!!achievement.description && (
        <Text style={styles.description} numberOfLines={2}>
          {achievement.description}
        </Text>
      )}

      {/* Footer row: rarity + XP */}
      <View style={styles.footer}>
        <View
          style={[
            styles.rarityBadge,
            { backgroundColor: rarity.bg, borderColor: rarity.border },
          ]}
        >
          <Text style={[styles.rarityText, { color: rarity.color }]}>
            {rarity.label}
          </Text>
        </View>
        <View style={styles.xpBadge}>
          <Ionicons name="sparkles" size={13} color="#7C3AED" />
          <Text style={styles.xpText}>+{achievement.xp_reward} XP</Text>
        </View>
      </View>

      {/* Auto-dismiss progress bar */}
      <AutoDismissBar durationMs={AUTO_DISMISS_MS} />
    </Animated.View>
  );
};

// ─── Thin progress bar that drains over AUTO_DISMISS_MS ──────────────────────

const AutoDismissBar = ({ durationMs }: { durationMs: number }) => {
  const width = useSharedValue(100);

  useEffect(() => {
    width.value = withTiming(0, { duration: durationMs });
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as `${number}%`,
  }));

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, barStyle]} />
    </View>
  );
};

// ─── Main export — reads queue from store ────────────────────────────────────

export const AchievementUnlockPopup: React.FC = () => {
  const { pendingAchievements, dismissTopAchievement } = useGamificationStore();
  const current = pendingAchievements[0];

  if (!current) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismissTopAchievement}
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <PopupCard
          // Use id as key so each achievement mounts fresh with its animation
          key={current.id}
          achievement={current}
          onDismiss={dismissTopAchievement}
        />
      </View>
    </Modal>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  rarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: "700",
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  xpText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#7C3AED",
  },
  progressTrack: {
    height: 3,
    width: "100%",
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 3,
    backgroundColor: "#4F46E5",
    borderRadius: 2,
  },
});
