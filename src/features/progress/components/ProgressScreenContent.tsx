import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProgressResult, ProgressSummary } from "../types";
import { buildProgressMetrics, sortResultsByDate } from "../utils";
import { ProgressEmptyState } from "./ProgressEmptyState";
import { ProgressMetricCard } from "./ProgressMetricCard";
import { RecentResultItem } from "./RecentResultItem";

type ProgressScreenContentProps = {
  summary: ProgressSummary;
  results: ProgressResult[];
  isLoading: boolean;
  isRefreshing: boolean;
  error?: string | null;
  onRefresh: () => void;
};

export const ProgressScreenContent = ({
  summary,
  results,
  isLoading,
  isRefreshing,
  error,
  onRefresh,
}: ProgressScreenContentProps) => {
  const metrics = buildProgressMetrics(summary);
  const recentResults = sortResultsByDate(results).slice(0, 5);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-text-secondary text-base font-medium mt-4">
          Đang tải tiến độ...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#4F46E5"
          />
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        <View className="mt-6 mb-7">
          <Text className="text-text-primary text-3xl font-bold mb-2">
            Tiến độ học tập
          </Text>
          <Text className="text-text-secondary text-base leading-6">
            Theo dõi điểm số, tỷ lệ đúng và thói quen luyện tập của bạn.
          </Text>
        </View>

        {error ? (
          <View className="bg-warning/10 border border-warning/20 rounded-3xl p-5 mb-5">
            <View className="flex-row items-start">
              <Ionicons name="alert-circle-outline" size={22} color="#F59E0B" />
              <View className="flex-1 ml-3">
                <Text className="text-warning font-bold mb-1">
                  Không thể tải dữ liệu
                </Text>
                <Text className="text-text-secondary text-sm leading-5 mb-4">
                  {error}
                </Text>
                <Pressable onPress={onRefresh} className="bg-warning rounded-2xl py-3">
                  <Text className="text-white text-center font-bold">Thử lại</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        {results.length === 0 && !error ? (
          <ProgressEmptyState />
        ) : (
          <>
            <View className="flex-row gap-3 mb-3">
              <ProgressMetricCard metric={metrics[0]} />
              <ProgressMetricCard metric={metrics[1]} />
            </View>

            <View className="mb-8">
              <ProgressMetricCard metric={metrics[2]} />
            </View>

            <View className="bg-white rounded-3xl border border-gray-100 p-5 mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-text-primary text-base font-bold">
                  Thành tích tốt nhất
                </Text>
                <Text className="text-primary font-bold">{summary.bestScore}%</Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View className="h-full bg-primary" style={{ width: `${summary.bestScore}%` }} />
              </View>
            </View>

            <View className="mb-2">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-text-primary text-xl font-bold">
                  Kết quả gần đây
                </Text>
                <Text className="text-text-secondary text-sm">
                  {summary.completedCount} bài
                </Text>
              </View>

              {recentResults.map((result) => (
                <RecentResultItem key={result.id || `${result.examId}-${result.completedAt}`} result={result} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
