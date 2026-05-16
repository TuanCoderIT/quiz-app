import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBackground } from "../../src/components/AppBackground";
import { QuizCard } from "../../src/components/QuizCard";
import { StatsCard } from "../../src/components/StatsCard";
import { useAuthStore } from "../../src/stores/auth.store";

const HomeScreen = () => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng,";
    if (hour < 18) return "Chào buổi chiều,";
    return "Chào buổi tối,";
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.name || "Bạn"}</Text>
              <Text style={styles.headerSub}>Sẵn sàng để tiếp tục học chưa?</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile")}
              style={styles.avatar}
            >
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={22} color="#4F46E5" />
              )}
            </TouchableOpacity>
          </View>

          {/* Continue Learning - Glass Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>TIẾP TỤC HỌC</Text>
            </View>
            <Text style={styles.heroTitle}>Kiến thức cơ bản về AI</Text>
            <Text style={styles.heroMeta}>Đã hoàn thành 12/20 câu hỏi</Text>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <TouchableOpacity
              style={styles.heroButton}
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/practice")}
            >
              <Text style={styles.heroButtonText}>Tiếp tục ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thống kê nhanh</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              <StatsCard label="Đã hoàn thành" value="24" color="#10B981" />
              <StatsCard label="Chính xác" value="85%" color="#4F46E5" />
              <StatsCard label="Chuỗi ngày" value="7" color="#F59E0B" />
              <StatsCard label="Điểm XP" value="1.2k" color="#7C3AED" />
            </ScrollView>
          </View>

          {/* Featured Quizzes */}
          <View style={styles.quizSection}>
            <View style={styles.quizHeader}>
              <Text style={styles.sectionTitle}>Quiz nổi bật</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/practice")}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <QuizCard
              title="Lập trình React Native"
              category="Mobile App"
              difficulty="Trung bình"
              questionCount={15}
            />
            <QuizCard
              title="Machine Learning 101"
              category="AI & Data"
              difficulty="Khó"
              questionCount={20}
            />
            <QuizCard
              title="Lịch sử thế giới"
              category="Xã hội"
              difficulty="Dễ"
              questionCount={10}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "500",
  },
  userName: {
    color: "#0F172A",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 2,
  },
  headerSub: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.7)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  // Hero
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.7)",
    padding: 22,
    marginBottom: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
  },
  heroBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: "#4F46E5",
    fontSize: 10,
    fontWeight: "800",
  },
  heroTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroMeta: {
    color: "#64748B",
    fontSize: 13,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
    marginTop: 16,
    marginBottom: 18,
    overflow: "hidden",
  },
  progressFill: {
    width: "60%",
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#4F46E5",
  },
  heroButton: {
    height: 44,
    borderRadius: 14,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  heroButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: 20,
    marginBottom: 12,
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
  seeAll: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 20,
  },
});

export default HomeScreen;
