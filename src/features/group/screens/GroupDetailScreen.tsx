import { useAuthStore } from "@/src/features/auth/store";
import { getReverbEcho } from "@/src/features/chat/chat.realtime";
import { getImageUrl } from "@/src/utils/image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../components/Emptystate";
import LoadingState from "../components/Loadingstate";
import PostCard from "../components/Postcard";
import {
  checkMembership,
  getGroupDetail,
  joinGroup,
  leaveGroup,
} from "../group.api";
import { GroupDetail, MembershipStatus } from "../group.types";
import { deletePost, getGroupPosts } from "../post.api";
import { Post } from "../post.types";

type PostCreatedPayload = {
  post?: Post;
  data?: Post;
};

type CommentCreatedPayload = {
  post_id?: number;
  postId?: number;
  comment?: {
    post_id?: number;
    postId?: number;
  };
};

function getRealtimePost(payload: PostCreatedPayload): Post | null {
  return payload.post ?? payload.data ?? null;
}

function getRealtimeCommentPostId(payload: CommentCreatedPayload) {
  return payload.post_id ?? payload.postId ?? payload.comment?.post_id ?? payload.comment?.postId;
}

export default function GroupDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadGroup = useCallback(async () => {
    try {
      const data = await getGroupDetail(slug);
      setGroup(data);
      const mem = await checkMembership(data.id);
      setMembership(mem);
    } catch {
      // error handled by empty state
    } finally {
      setLoadingGroup(false);
    }
  }, [slug]);

  const loadPosts = useCallback(
    async (pg = 1, reset = false) => {
      if (!group) return;
      try {
        if (pg === 1 && reset) setLoadingPosts(true);
        else if (pg > 1) setLoadingMore(true);

        const res = await getGroupPosts(group.id, pg);
        setPosts((prev) => (pg === 1 ? res.data : [...prev, ...res.data]));
        setHasMore(pg < res.last_page);
        setPage(pg);
      } catch {
        // silent
      } finally {
        setLoadingPosts(false);
        setLoadingMore(false);
      }
    },
    [group],
  );

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  useEffect(() => {
    if (group) loadPosts(1, true);
  }, [group, loadPosts]);

  useEffect(() => {
    if (!group) return;

    const echo = getReverbEcho();
    const channelName = `group.${group.id}.posts`;
    const channel = echo.channel(channelName);

    channel.subscribed(() => {
      console.log("Subscribed:", channelName);
    });

    channel.error((error: unknown) => {
      console.log("Subscription error:", channelName, error);
    });

    channel.listen(".post.created", (payload: PostCreatedPayload) => {
      console.log("POST CREATED", payload);

      const realtimePost = getRealtimePost(payload);
      if (!realtimePost) return;

      setPosts((prev) => {
        const exists = prev.some((post) => post.id === realtimePost.id);
        if (exists) return prev;
        return [realtimePost, ...prev];
      });
    });

    channel.listen(".comment.created", (payload: CommentCreatedPayload) => {
      console.log("COMMENT CREATED", payload);

      const postId = getRealtimeCommentPostId(payload);
      if (!postId) return;

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments_count: post.comments_count + 1 }
            : post,
        ),
      );
    });

    return () => {
      channel.stopListening(".post.created");
      channel.stopListening(".comment.created");
      echo.leaveChannel(channelName);
    };
  }, [group]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGroup();
    await loadPosts(1, true);
    setRefreshing(false);
  };

  const handleJoin = async () => {
    if (!group) return;
    setActionLoading(true);
    try {
      await joinGroup(group.id);
      const mem = await checkMembership(group.id);
      setMembership(mem);
      setGroup((g) => (g ? { ...g, members_count: g.members_count + 1 } : g));
    } catch {
      Alert.alert("Lỗi", "Không thể tham gia nhóm.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = () => {
    Alert.alert("Rời nhóm", "Bạn chắc chắn muốn rời khỏi nhóm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Rời nhóm",
        style: "destructive",
        onPress: async () => {
          if (!group) return;
          setActionLoading(true);
          try {
            await leaveGroup(group.id);
            const mem = await checkMembership(group.id);
            setMembership(mem);
            setGroup((g) =>
              g ? { ...g, members_count: Math.max(0, g.members_count - 1) } : g,
            );
          } catch {
            Alert.alert("Lỗi", "Không thể rời nhóm.");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      Alert.alert("Lỗi", "Không thể xóa bài viết.");
    }
  };

  const isOwnerOrAdmin =
    membership?.role === "owner" || membership?.role === "admin";

  if (loadingGroup) return <LoadingState message="Đang tải nhóm..." />;
  if (!group) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Không tìm thấy nhóm"
          description="Nhóm này không tồn tại hoặc đã bị xóa."
        />
      </SafeAreaView>
    );
  }

  const imageUrl = getImageUrl(group.cover_image);
  const ListHeader = (
    <View>
      {/* Cover */}
      <View className="h-44 w-full bg-primary/10">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Ionicons name="people" size={48} color="#4F46E5" opacity={0.3} />
          </View>
        )}
      </View>

      {/* Group info */}
      <View className="px-5 pb-4 pt-4">
        <Text className="text-2xl font-bold text-text-primary">
          {group.name}
        </Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Ionicons
            name={
              group.visibility === "private"
                ? "lock-closed-outline"
                : "earth-outline"
            }
            size={13}
            color="#6B7280"
          />
          <Text className="text-sm text-text-secondary">
            {group.visibility === "private"
              ? "Nhóm riêng tư"
              : "Nhóm công khai"}
          </Text>
          <Text className="text-text-secondary">·</Text>
          <Text className="text-sm text-text-secondary">
            {group.members_count.toLocaleString()} thành viên
          </Text>
        </View>

        {group.description && (
          <Text className="mt-3 text-sm leading-6 text-text-secondary">
            {group.description}
          </Text>
        )}

        {/* Action buttons */}
        <View className="mt-4 flex-row gap-3">
          {membership?.is_member ? (
            <>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/group/[slug]/create-post",
                    params: { slug: group.slug },
                  })
                }
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3"
              >
                <Ionicons name="create-outline" size={18} color="white" />
                <Text className="text-sm font-semibold text-white">
                  Đăng bài
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/group/[slug]/chat",
                    params: { slug: group.slug },
                  } as any)
                }
                className="rounded-2xl bg-indigo-600 px-4 py-3"
              >
                <Text className="text-center font-bold text-white">
                  Chat nhóm
                </Text>
              </TouchableOpacity>
              {!membership.is_owner && (
                <TouchableOpacity
                  onPress={handleLeave}
                  disabled={actionLoading}
                  className="flex-row items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3"
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#6B7280" />
                  ) : (
                    <Ionicons name="exit-outline" size={18} color="#6B7280" />
                  )}
                  <Text className="text-sm font-medium text-text-secondary">
                    Rời nhóm
                  </Text>
                </TouchableOpacity>
              )}
              {isOwnerOrAdmin && (
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/group/${slug}/members`)
                  }
                  className="items-center justify-center rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <Ionicons name="settings-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
              )}
            </>
          ) : membership?.has_pending_request ? (
            <View className="flex-1 items-center rounded-xl border border-border bg-muted py-3">
              <Text className="text-sm font-medium text-text-secondary">
                Đang chờ duyệt...
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleJoin}
              disabled={actionLoading}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3"
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="person-add-outline" size={18} color="white" />
              )}
              <Text className="text-sm font-semibold text-white">
                {group.visibility === "private"
                  ? "Xin tham gia"
                  : "Tham gia nhóm"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="mx-5 mb-4 border-b border-border" />

      <Text className="mb-3 px-5 text-base font-semibold text-text-primary">
        Bài viết
      </Text>

      {loadingPosts && <LoadingState />}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute left-4 top-12 z-10 h-9 w-9 items-center justify-center rounded-full bg-black/30"
        style={styles.backBtn}
      >
        <Ionicons name="chevron-back" size={20} color="white" />
      </TouchableOpacity>

      <FlatList
        data={loadingPosts ? [] : posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View className="px-5">
            <PostCard
              post={item}
              currentUserId={currentUserId}
              isOwnerOrAdmin={isOwnerOrAdmin}
              onDelete={handleDeletePost}
              onRefresh={() => loadPosts(1)}
            />
          </View>
        )}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={() => {
          if (!loadingMore && hasMore) loadPosts(page + 1);
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          !loadingPosts ? (
            <View className="px-5">
              <EmptyState
                icon="document-text-outline"
                title="Chưa có bài viết nào"
                description={
                  membership?.is_member
                    ? "Hãy là người đầu tiên đăng bài trong nhóm này!"
                    : "Tham gia nhóm để xem và đăng bài viết."
                }
              />
            </View>
          ) : null
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color="#4F46E5" style={{ marginVertical: 16 }} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
