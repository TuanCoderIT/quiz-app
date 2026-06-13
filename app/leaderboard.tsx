import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { getLeaderboard } from "../src/features/leaderboard/api";
import {
  LeaderboardResponse,
  LeaderboardUser,
} from "../src/features/leaderboard/types";

export default function LeaderboardScreen() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const visibleUsers = showAll
    ? data?.data ?? []
    : data?.data.slice(0, 10) ?? [];

  const fetchLeaderboard = async () => {
    try {
      const result = await getLeaderboard();
      setData(result);
    } catch (error) {
      console.log("Lỗi tải bảng xếp hạng:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
        <Text className="mt-3 text-gray-500">Đang tải bảng xếp hạng...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-start justify-between bg-white px-5 pb-5 pt-12">
        <View className="flex-1 pr-4">
          <Text className="text-2xl font-bold text-gray-900">
            Bảng xếp hạng
          </Text>
          <Text className="mt-1 text-gray-500">
            Top 100 người dùng có XP cao nhất
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Text className="text-xl text-gray-700">×</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={visibleUsers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: data?.me ? 140 : 40,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => <LeaderboardItem item={item} />}
        ListFooterComponent={
          data && data.data.length > 10 ? (
            <TouchableOpacity
              onPress={() => setShowAll(!showAll)}
              className="mt-2 rounded-2xl bg-white p-4"
            >
              <Text className="text-center font-semibold text-indigo-600">
                {showAll ? "Thu gọn" : "Xem tất cả"}
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {data?.me && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-5 pb-6 pt-3">
          <View className="rounded-2xl bg-indigo-600 p-4">
            <Text className="text-white/80">Thứ hạng của bạn</Text>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-white">
                #{data.me.rank}
              </Text>
              <Text className="text-lg font-semibold text-white">
                {data.me.xp} XP
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function LeaderboardItem({ item }: { item: LeaderboardUser }) {
  const medal =
    item.rank === 1
      ? "🥇"
      : item.rank === 2
        ? "🥈"
        : item.rank === 3
          ? "🥉"
          : null;

  return (
    <View
      className={`mb-3 flex-row items-center rounded-2xl p-4 ${
        item.isCurrentUser
          ? "border border-indigo-200 bg-indigo-50"
          : "bg-white"
      }`}
    >
      <View className="w-12 items-center">
        <Text className="text-lg font-bold text-gray-800">
          {medal ?? `#${item.rank}`}
        </Text>
      </View>

      <View className="ml-3 h-11 w-11 items-center justify-center rounded-full bg-gray-200">
        <Text className="font-bold text-gray-700">
          {item.name?.charAt(0)?.toUpperCase() ?? "U"}
        </Text>
      </View>

      <View className="ml-3 flex-1">
        <Text className="font-semibold text-gray-900" numberOfLines={1}>
          {item.name}
          {item.isCurrentUser ? "  (Bạn)" : ""}
        </Text>
        <Text className="text-sm text-gray-500">{item.xp} XP</Text>
      </View>
    </View>
  );
}