import { getImageUrl } from "@/src/utils/image";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/features/auth/store";
import { getFlashcardSummary } from "../../src/features/flashcard/api";
import { FlashcardSummary } from "../../src/features/flashcard/types";
import { useGamificationStore } from "../../src/features/gamification/store";
import { getProgressResults } from "../../src/features/progress/api";
import { ProgressResult } from "../../src/features/progress/types";
import {
  calculateProgressSummary,
  formatCompletedDate,
  sortResultsByDate,
} from "../../src/features/progress/utils";

type IconName = keyof typeof Ionicons.glyphMap;

const formatNumber = (value?: number) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0));

const formatStudyTime = (seconds: number) => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} phút`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}g ${remainder}p` : `${hours} giờ`;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-4 text-xl font-bold text-text-primary">{children}</Text>
  );
}

function ProgressStat({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View className="w-[48%] rounded-2xl border border-gray-100 bg-white p-4">
      <Ionicons name={icon} size={21} color="#4F46E5" />
      <Text className="mt-4 text-2xl font-bold text-text-primary">{value}</Text>
      <Text className="mt-1 text-xs leading-4 text-text-secondary">
        {label}
      </Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[48%] flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 active:bg-gray-50"
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
        <Ionicons name={icon} size={20} color="#4F46E5" />
      </View>
      <Text className="flex-1 font-semibold text-text-primary">{label}</Text>
      <Ionicons name="chevron-forward" size={17} color="#94A3B8" />
    </Pressable>
  );
}

function RecentResult({ result }: { result: ProgressResult }) {
  return (
    <View className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-success/10">
        <Ionicons name="checkmark" size={21} color="#10B981" />
      </View>
      <View className="flex-1 pr-3">
        <Text className="font-semibold text-text-primary" numberOfLines={1}>
          {result.exam?.title || `Quiz #${result.examId}`}
        </Text>
        <Text className="mt-1 text-xs text-text-secondary">
          {formatCompletedDate(result.completedAt)} · {result.score}/
          {result.total} câu
        </Text>
      </View>
      <Text className="font-bold text-primary">{result.percentage}%</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuthStore();
  const { summary: gamification, fetchSummary } = useGamificationStore();
  const [results, setResults] = useState<ProgressResult[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [gender, setGender] = useState(user?.gender ?? "other");
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  // const [saving, setSaving] = useState(false);

  const progress = useMemo(() => calculateProgressSummary(results), [results]);
  const recentResults = useMemo(
    () => sortResultsByDate(results).slice(0, 3),
    [results],
  );

  const avatarUrl = getImageUrl(user?.avatar);

  const loadDashboard = useCallback(
    async (refreshing = false) => {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const [nextResults, nextFlashcards] = await Promise.all([
          getProgressResults(),
          getFlashcardSummary(),
          refreshUser(),
          fetchSummary(),
        ]);
        setResults(nextResults);
        setFlashcards(nextFlashcards);
      } catch (loadError) {
        console.error("Lỗi tải bảng điều khiển cá nhân:", loadError);
        setError("Không thể cập nhật toàn bộ dữ liệu. Kéo xuống để thử lại.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [fetchSummary, refreshUser],
  );

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: logout },
    ]);
  };

  const showComingSoon = (feature: string) =>
    Alert.alert(feature, "Tính năng này đang được phát triển.");

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor="#4F46E5"
          />
        }
        contentContainerClassName="px-5 pb-32"
      >
        <Text className="mb-5 mt-4 text-3xl font-bold text-text-primary">
          Hồ sơ
        </Text>

        <View className="rounded-3xl bg-white p-5" style={styles.cardShadow}>
          <View className="flex-row items-start">
            <Image
              source={
                avatarUrl || require("../../assets/images/default_avatar.png")
              }
              className="h-20 w-20 rounded-2xl bg-gray-100"
              contentFit="cover"
              transition={200}
            />

            <View className="ml-4 flex-1">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text
                    className="text-xl font-bold text-text-primary"
                    numberOfLines={1}
                  >
                    {user?.name || "Người dùng"}
                  </Text>

                  {user?.email ? (
                    <Text
                      className="mt-1 text-sm text-text-secondary"
                      numberOfLines={1}
                    >
                      {user.email}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  onPress={() => router.push("/edit-profile")}
                  className="h-9 w-9 items-center justify-center rounded-full bg-indigo-50 active:bg-indigo-100"
                >
                  <Ionicons name="create-outline" size={18} color="#4F46E5" />
                </Pressable>
              </View>

              {user?.bio ? (
                <Text
                  className="mt-3 text-sm leading-5 text-gray-500"
                  numberOfLines={2}
                >
                  {user.bio}
                </Text>
              ) : (
                <Text className="mt-3 text-sm text-gray-400">
                  Hoàn thiện hồ sơ để cá nhân hóa trải nghiệm học tập.
                </Text>
              )}
            </View>
          </View>

          <View className="mt-5 flex-row rounded-2xl bg-gray-50 p-3">
            <View className="flex-1 items-center">
              <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                <Ionicons name="flash" size={18} color="#F59E0B" />
              </View>
              <Text className="text-base font-bold text-gray-900">
                {formatNumber(gamification?.xp ?? user?.xp)}
              </Text>
              <Text className="mt-1 text-xs text-gray-500">XP</Text>
            </View>

            <View className="mx-2 w-px bg-gray-200" />

            <View className="flex-1 items-center">
              <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                <Ionicons name="star" size={18} color="#4F46E5" />
              </View>
              <Text className="text-base font-bold text-gray-900">
                {gamification?.level ?? 1}
              </Text>
              <Text className="mt-1 text-xs text-gray-500">Cấp</Text>
            </View>

            <View className="mx-2 w-px bg-gray-200" />

            <View className="flex-1 items-center">
              <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="flame" size={18} color="#EF4444" />
              </View>
              <Text className="text-base font-bold text-gray-900">
                {formatNumber(
                  gamification?.current_streak ?? user?.current_streak,
                )}
              </Text>
              <Text className="mt-1 text-xs text-gray-500">Streak</Text>
            </View>
          </View>
        </View>

        <View className="mx-5 rounded-3xl bg-white p-5">
          <Text className="mb-4 text-lg font-bold text-gray-900">
            Thông tin cá nhân
          </Text>

          <ProfileInput
            label="Họ và tên"
            value={name}
            onChangeText={setName}
            placeholder="Nhập họ và tên"
          />

          <Text className="mb-2 mt-4 text-sm font-semibold text-gray-700">
            Giới tính
          </Text>

          <View className="flex-row gap-2">
            {[
              { label: "Nam", value: "male" },
              { label: "Nữ", value: "female" },
              { label: "Khác", value: "other" },
            ].map((item) => (
              <Pressable
                key={item.value}
                onPress={() => setGender(item.value)}
                className={`flex-1 rounded-xl py-3 ${
                  gender === item.value ? "bg-indigo-600" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    gender === item.value ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <ProfileInput
            label="Ngày sinh"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="YYYY-MM-DD"
          />

          <ProfileInput
            label="Số điện thoại"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />

          <ProfileInput
            label="Giới thiệu"
            value={bio}
            onChangeText={setBio}
            placeholder="Nói vài dòng về bạn..."
            multiline
          />
        </View>

        {error ? (
          <View className="mt-4 flex-row rounded-2xl border border-warning/20 bg-warning/10 p-4">
            <Ionicons name="alert-circle-outline" size={20} color="#F59E0B" />
            <Text className="ml-3 flex-1 text-sm leading-5 text-text-secondary">
              {error}
            </Text>
          </View>
        ) : null}

        <View className="mt-7">
          <SectionTitle>Tiến độ học tập</SectionTitle>
          {isLoading ? (
            <View className="items-center rounded-3xl bg-white py-10">
              <ActivityIndicator color="#4F46E5" />
            </View>
          ) : (
            <>
              <View className="flex-row flex-wrap justify-between gap-y-3">
                <ProgressStat
                  icon="checkmark-circle-outline"
                  label="Quiz đã hoàn thành"
                  value={formatNumber(progress.completedCount)}
                />
                <ProgressStat
                  icon="analytics-outline"
                  label="Điểm trung bình"
                  value={`${progress.averageScore}%`}
                />
                <ProgressStat
                  icon="layers-outline"
                  label="Flashcards đã thuộc"
                  value={formatNumber(flashcards?.masteredCount)}
                />
                <ProgressStat
                  icon="time-outline"
                  label="Thời gian học quiz"
                  value={formatStudyTime(progress.totalStudyTime)}
                />
                <ProgressStat
                  icon="shield-checkmark-outline"
                  label="Tỷ lệ trả lời đúng"
                  value={`${progress.accuracyRate}%`}
                />
                <ProgressStat
                  icon="ribbon-outline"
                  label="Điểm cao nhất"
                  value={`${progress.bestScore}%`}
                />
              </View>

              {results.length === 0 ? (
                <View className="mt-3 items-center rounded-3xl border border-gray-100 bg-white p-7">
                  <Ionicons
                    name="bar-chart-outline"
                    size={30}
                    color="#4F46E5"
                  />
                  <Text className="mt-3 font-semibold text-text-primary">
                    Chưa có dữ liệu quiz
                  </Text>
                  <Text className="mt-1 text-center text-sm text-text-secondary">
                    Hoàn thành một quiz để bắt đầu theo dõi tiến độ.
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </View>

        <View className="mt-7">
          <SectionTitle>Thao tác nhanh</SectionTitle>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            <QuickAction
              icon="trophy-outline"
              label="Thành tích"
              onPress={() => router.push("/achievements")}
            />
            <QuickAction
              icon="podium-outline"
              label="Bảng xếp hạng"
              onPress={() => router.push("/leaderboard")}
            />
            <QuickAction
              icon="people-outline"
              label="Nhóm của tôi"
              onPress={() => router.push("/group" as Href)}
            />
            <QuickAction
              icon="settings-outline"
              label="Cài đặt"
              onPress={() => showComingSoon("Cài đặt")}
            />
          </View>
        </View>

        {recentResults.length > 0 ? (
          <View className="mt-7">
            <SectionTitle>Kết quả gần đây</SectionTitle>
            {recentResults.map((result) => (
              <RecentResult
                key={result.id || `${result.examId}-${result.completedAt}`}
                result={result}
              />
            ))}
          </View>
        ) : null}

        <Pressable
          onPress={handleLogout}
          className="mt-8 flex-row items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-4 active:bg-red-100"
        >
          <Ionicons name="log-out-outline" size={21} color="#EF4444" />
          <Text className="ml-2 font-bold text-error">Đăng xuất</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
});

function ProfileInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "phone-pad";
  multiline?: boolean;
}) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-sm font-semibold text-gray-700">{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        className={`rounded-xl bg-gray-50 px-4 text-base text-gray-900 ${
          multiline ? "h-28 py-3" : "h-12"
        }`}
      />
    </View>
  );
}
