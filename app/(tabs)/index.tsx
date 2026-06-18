import { AppCard } from "@/src/components/common/GlassCard";
import { NotificationBadge } from "@/src/features/notification/components/NotificationBadge";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBackground } from "../../src/components/common/AppBackground";
import { useAuthStore } from "../../src/features/auth/store";
import { useFlashcardStore } from "../../src/features/flashcard/store";
import { useGamificationStore } from "../../src/features/gamification/store";

const HomeScreen = () => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const decks = useFlashcardStore((state) => state.decks);
  const fetchDecks = useFlashcardStore((state) => state.fetchDecks);
  const gamificationSummary = useGamificationStore((state) => state.summary);
  const fetchSummary = useGamificationStore((state) => state.fetchSummary);

  const formatNumber = (value?: number) =>
    new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(
      Number(value || 0),
    );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng,";
    if (hour < 18) return "Chào buổi chiều,";
    return "Chào buổi tối,";
  };

  useEffect(() => {
    void fetchDecks();
    void fetchSummary();
  }, [fetchDecks, fetchSummary]);

  const homeStats = useMemo(() => {
    const totalCards = decks.reduce((sum, deck) => sum + deck.cardCount, 0);
    const dueToday = decks.reduce((sum, deck) => sum + deck.dueCount, 0);
    const featuredDeck = [...decks].sort((a, b) => b.dueCount - a.dueCount)[0];
    const streak =
      gamificationSummary?.current_streak ?? user?.current_streak ?? 0;
    const xp = gamificationSummary?.xp ?? user?.xp ?? 0;
    const level = gamificationSummary?.level ?? Math.max(1, Math.floor(xp / 100) + 1);

    return {
      totalCards,
      dueToday,
      featuredDeck,
      streak,
      xp,
      level,
    };
  }, [decks, gamificationSummary, user?.current_streak, user?.xp]);

  const goals = useMemo(
    () => [
      {
        done: homeStats.streak > 0,
        label: "Giữ streak học tập",
      },
      {
        done: homeStats.totalCards > 0 && homeStats.dueToday === 0,
        label:
          homeStats.dueToday > 0
            ? `Ôn ${homeStats.dueToday} thẻ đến hạn`
            : "Ôn hết thẻ đến hạn",
      },
      {
        done: decks.length > 0,
        label: "Có ít nhất 1 bộ flashcard",
      },
    ],
    [decks.length, homeStats.dueToday, homeStats.streak, homeStats.totalCards],
  );
  const completedGoals = goals.filter((goal) => goal.done).length;
  const goalProgress = Math.round((completedGoals / goals.length) * 100);
  const primaryLearningRoute =
    homeStats.dueToday > 0 && homeStats.featuredDeck
      ? {
          pathname: "/flashcard/study" as const,
          params: { id: homeStats.featuredDeck.id },
        }
      : "/(tabs)/practice";

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting} className="font-medium">{getGreeting()}</Text>
              <Text style={styles.userName} className="font-semibold">{user?.name || "Bạn"}</Text>
              <Text style={styles.headerSub} className="font-medium">
                Học 10 phút hôm nay để giữ nhịp nhé
              </Text>
            </View>

            <View style={styles.headerActions}>
              <NotificationBadge />
            </View>
          </View>

          {/* Today Focus */}
          <AppCard style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroBadge}>
                <Ionicons name="calendar-clear" size={14} color="#4F46E5" />
                <Text style={styles.heroBadgeText} className="font-semibold">ÔN TẬP HÔM NAY</Text>
              </View>

              <View style={styles.streakPill}>
                <Ionicons name="flame" size={14} color="#F59E0B" />
                <Text style={styles.streakText} className="font-medium">
                  {formatNumber(homeStats.streak)} ngày
                </Text>
              </View>
            </View>

            <Text style={styles.heroTitle} className="font-medium">
              {homeStats.dueToday > 0
                ? `${homeStats.dueToday} thẻ cần ôn`
                : "Bạn đang giữ nhịp tốt"}
            </Text>
            <Text style={styles.heroMeta}>
              {homeStats.featuredDeck
                ? `Ưu tiên: ${homeStats.featuredDeck.title}`
                : "Bắt đầu bằng một bài quiz ngắn hoặc tạo bộ thẻ mới."}
            </Text>

            <View style={styles.heroInsightRow}>
              <View style={styles.heroInsight}>
                <Text style={styles.heroInsightValue}className="font-medium">
                  {formatNumber(homeStats.totalCards)}
                </Text>
                <Text style={styles.heroInsightLabel} className="font-medium">Tổng thẻ</Text>
              </View>
              <View style={styles.heroInsight}>
                <Text style={styles.heroInsightValue}className="font-medium">
                  {formatNumber(homeStats.xp)}
                </Text>
                <Text style={styles.heroInsightLabel} className="font-medium">XP tích lũy</Text>
              </View>
              <View style={styles.heroInsight}>
                <Text style={styles.heroInsightValue}className="font-medium">
                  {homeStats.level}
                </Text>
                <Text style={styles.heroInsightLabel} className="font-medium">Cấp độ</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.heroButton}
              activeOpacity={0.85}
              onPress={() => router.push(primaryLearningRoute)}
            >
              <Text style={styles.heroButtonText} className="font-medium">
                {homeStats.dueToday > 0 ? "Ôn flashcard ngay" : "Làm quiz ngắn"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </AppCard>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle} className="font-medium">Bạn muốn học gì hôm nay?</Text>

            <View style={styles.quickGrid}>
              <QuickAction
                icon="help-circle"
                title="Làm quiz"
                subtitle="Luyện câu hỏi"
                color="#4F46E5"
                onPress={() => router.push("/(tabs)/practice")}
              />

              <QuickAction
                icon="albums"
                title="Flashcard"
                subtitle="Ôn kiến thức"
                color="#10B981"
                onPress={() => router.push("/(tabs)/flashcard")}
              />

              <QuickAction
                icon="add-circle"
                title="Tạo bộ thẻ"
                subtitle="Tự tạo bài học"
                color="#F59E0B"
                onPress={() => router.push("/flashcard/create")}
              />

              <QuickAction
                icon="sparkles"
                title="AI Quiz"
                subtitle="Tạo bằng AI"
                color="#7C3AED"
                onPress={() => router.push("/")}
              />
            </View>
          </View>

          {/* Daily Goal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle} className="font-medium">Mục tiêu hôm nay</Text>

            <AppCard style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View>
                  <Text style={styles.goalTitle}>
                    {completedGoals}/{goals.length} mục tiêu
                  </Text>
                  <Text style={styles.goalSub}>
                    Hoàn thành vài việc nhỏ để giữ nhịp
                  </Text>
                </View>

                <View style={styles.goalIcon}>
                  <Ionicons name="trophy" size={20} color="#F59E0B" />
                </View>
              </View>

              <View style={styles.goalProgressTrack}>
                <View
                  style={[
                    styles.goalProgressFill,
                    { width: `${goalProgress}%` },
                  ]}
                />
              </View>

              <View style={styles.todoList}>
                {goals.map((goal) => (
                  <TodoItem key={goal.label} done={goal.done} label={goal.label} />
                ))}
              </View>

              <TouchableOpacity
                style={styles.goalAction}
                activeOpacity={0.82}
                onPress={() => router.push(primaryLearningRoute)}
              >
                <Text style={styles.goalActionText}>Bắt đầu mục tiêu</Text>
                <Ionicons name="arrow-forward" size={16} color="#4F46E5" />
              </TouchableOpacity>
            </AppCard>
          </View>

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle} className="font-medium">Thống kê nhanh</Text>

            <View style={styles.statsGrid}>
              <StatBox label="Hoàn thành" value="24" icon="checkmark-done" />
              <StatBox label="Chính xác" value="85%" icon="analytics" />
              <StatBox
                label="Streak"
                value={formatNumber(user?.current_streak)}
                icon="flame"
              />
              <StatBox label="XP" value={formatNumber(user?.xp)} icon="flash" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
};

const QuickAction = ({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      style={styles.quickAction}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={[styles.quickIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
};

const TodoItem = ({ done, label }: { done: boolean; label: string }) => {
  return (
    <View style={styles.todoItem}>
      <Ionicons
        name={done ? "checkmark-circle" : "ellipse-outline"}
        size={18}
        color={done ? "#10B981" : "#CBD5E1"}
      />
      <Text style={[styles.todoText, done && styles.todoTextDone]}>
        {label}
      </Text>
    </View>
  );
};

const StatBox = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) => {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={20} color="#4F46E5" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 22,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
    paddingRight: 16,
  },
  greeting: {
    color: "#64748B",
    fontSize: 15,
  },
  userName: {
    color: "#0F172A",
    fontSize: 27,
    marginTop: 2,
  },
  headerSub: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 5,
  },
  heroCard: {
    marginBottom: 24,
    marginHorizontal: 12,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: "#4F46E5",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  streakText: {
    color: "#B45309",
    fontSize: 12,
  },
  heroTitle: {
    marginTop: 16,
    fontSize: 25,
    color: "#0F172A",
  },
  heroMeta: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748B",
  },
  heroInsightRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  heroInsight: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#fffffe",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  heroInsightValue: {
    color: "#0F172A",
    fontSize: 18,
  },
  heroInsightLabel: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
  },
  heroButton: {
    marginTop: 22,
    height: 50,
    borderRadius: 17,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  heroButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 18,
    marginBottom: 14,
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.9)",
    borderRadius: 20,
    padding: 14,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },
  quickSubtitle: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 3,
  },

  goalCard: {
    marginHorizontal: 0,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalTitle: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
  },
  goalSub: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 4,
  },
  goalIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
  },
  goalProgressTrack: {
    marginTop: 18,
    height: 9,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },
  goalProgressFill: {
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 999,
  },
  todoList: {
    marginTop: 16,
    gap: 10,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  todoText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  todoTextDone: {
    color: "#0F172A",
  },
  goalAction: {
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
  },
  goalActionText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "800",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statBox: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.9)",
    borderRadius: 20,
    padding: 16,
  },
  statValue: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 10,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },

  reviewCard: {
    marginHorizontal: 0,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  reviewLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  reviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewContent: {
    flex: 1,
  },
  reviewTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },
  reviewDescription: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  reviewButton: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  reviewButtonText: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "800",
  },

  quizSection: {
    paddingHorizontal: 20,
  },
  quizHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  quizTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },
  seeAll: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "800",
  },
});

export default HomeScreen;
