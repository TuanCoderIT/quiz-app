import EmptyState from "@/src/features/group/components/Emptystate";
import GroupCard from "@/src/features/group/components/Groupcard";
import LoadingState from "@/src/features/group/components/Loadingstate";
import { getGroups, getMyGroups } from "@/src/features/group/group.api";
import { Group } from "@/src/features/group/group.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SortOption = "latest" | "members" | "oldest";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Mới nhất", value: "latest" },
  { label: "Nhiều thành viên", value: "members" },
  { label: "Cũ nhất", value: "oldest" },
];

export default function CommunityScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"discover" | "my">("discover");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGroups = useCallback(
    async (pg = 1, q = search, sort = sortBy, reset = false) => {
      try {
        setError(null);
        if (pg === 1) reset ? setLoading(true) : setRefreshing(true);
        else setLoadingMore(true);

        const res = await getGroups({
          page: pg,
          search: q || undefined,
          sort_by: sort,
          per_page: 10,
          visibility: "public",
        });

        setGroups((prev) => (pg === 1 ? res.data : [...prev, ...res.data]));
        setHasMore(pg < res.last_page);
        setPage(pg);
      } catch {
        setError("Không thể tải danh sách nhóm.");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [search, sortBy],
  );

  const fetchMyGroups = useCallback(async () => {
    try {
      const data = await getMyGroups();
      setMyGroups(data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchGroups(1, search, sortBy, true);
    fetchMyGroups();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchGroups(1, text, sortBy, true);
    }, 400);
  };

  const handleSort = (sort: SortOption) => {
    setSortBy(sort);
    fetchGroups(1, search, sort, true);
  };

  const handleRefresh = () => {
    fetchGroups(1, search, sortBy, false);
    fetchMyGroups();
  };

  const handleGroupPress = (group: Group) => {
    router.push({
      pathname: "/group/[slug]",
      params: { slug: group.slug },
    });
  };

  const currentList = tab === "discover" ? groups : myGroups;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-text-primary">Cộng đồng</Text>
        <TouchableOpacity
          onPress={() => router.push("/group/create-group")}
          className="flex-row items-center gap-1.5 rounded-full bg-primary px-4 py-2"
        >
          <Ionicons name="add" size={16} color="white" />
          <Text className="text-sm font-semibold text-white">Tạo nhóm</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="mx-5 mb-3 flex-row items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Tìm kiếm nhóm..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-sm text-text-primary"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View className="mx-5 mb-3 flex-row gap-2">
        {[
          { key: "discover", label: "Khám phá" },
          { key: "my", label: "Nhóm của tôi" },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key as "discover" | "my")}
            className={`rounded-full px-4 py-2 ${
              tab === t.key ? "bg-primary" : "bg-muted"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                tab === t.key ? "text-white" : "text-text-secondary"
              }`}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort options (discover only) */}
      {tab === "discover" && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => handleSort(opt.value)}
              className={`rounded-full border px-3 py-1.5 ${
                sortBy === opt.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  sortBy === opt.value ? "text-primary" : "text-text-secondary"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Content */}
      {loading ? (
        <LoadingState message="Đang tải nhóm..." />
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={40} color="#9CA3AF" />
          <Text className="mt-3 text-center text-text-secondary">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchGroups(1, search, sortBy, true)}
            className="mt-4 rounded-full bg-primary px-5 py-2.5"
          >
            <Text className="text-sm font-semibold text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <GroupCard group={item} onPress={() => handleGroupPress(item)} />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReached={
            tab === "discover"
              ? () => {
                  if (!loadingMore && hasMore) fetchGroups(page + 1);
                }
              : undefined
          }
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title={
                tab === "my"
                  ? "Bạn chưa tham gia nhóm nào"
                  : "Không tìm thấy nhóm"
              }
              description={
                tab === "my"
                  ? "Khám phá và tham gia các nhóm học tập bên dưới."
                  : "Thử tìm kiếm với từ khóa khác."
              }
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color="#4F46E5"
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
