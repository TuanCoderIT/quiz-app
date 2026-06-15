import { getImageUrl } from "@/src/utils/image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  createPostComment,
  getPostComments,
  reactToPost,
  removePostReaction,
} from "../post.api";
import { Post, PostComment, ReactionType } from "../post.types";

const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😠",
};

interface PostCardProps {
  post: Post;
  currentUserId?: number;
  isOwnerOrAdmin?: boolean;
  onDelete?: (postId: number) => void;
  onRefresh?: () => void;
}

export default function PostCard({
  post,
  currentUserId,
  isOwnerOrAdmin,
  onDelete,
  onRefresh,
}: PostCardProps) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(
    post.user_reaction,
  );
  const [reactionsCount, setReactionsCount] = useState(post.reactions_count);
  const [reactionSummary, setReactionSummary] = useState(post.reaction_summary);
  const [showReactions, setShowReactions] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    setUserReaction(post.user_reaction);
    setReactionsCount(post.reactions_count);
    setReactionSummary(post.reaction_summary);
    setCommentsCount(post.comments_count);
  }, [post]);

  const isOwn = currentUserId === post.user_id;
  // const canDelete = isOwn || isOwnerOrAdmin;

  const avatarUrl = getImageUrl(post.user.avatar);
  const avatarLetter = post.user.name?.[0]?.toUpperCase() ?? "?";

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    const days = Math.floor(hrs / 24);
    return `${days} ngày trước`;
  };

  const handleReact = async (type: ReactionType) => {
    if (reacting) return;
    const previousReaction = userReaction;
    const previousCount = reactionsCount;
    const previousSummary = reactionSummary;
    const isRemoving = previousReaction === type;
    const nextReaction = isRemoving ? null : type;

    setReacting(true);
    setShowReactions(false);
    setUserReaction(nextReaction);
    setReactionsCount((count) =>
      isRemoving
        ? Math.max(0, count - 1)
        : previousReaction
          ? count
          : count + 1,
    );
    setReactionSummary((summary) => {
      const next = { ...summary };
      if (previousReaction) {
        next[previousReaction] = Math.max(0, next[previousReaction] - 1);
      }
      if (nextReaction) next[nextReaction] += 1;
      return next;
    });

    try {
      if (isRemoving) {
        await removePostReaction(post.id);
      } else {
        await reactToPost(post.id, type);
      }
    } catch {
      setUserReaction(previousReaction);
      setReactionsCount(previousCount);
      setReactionSummary(previousSummary);
      Alert.alert("Lỗi", "Không thể cập nhật cảm xúc. Vui lòng thử lại.");
    } finally {
      setReacting(false);
    }
  };

  const handleToggleComments = async () => {
    const shouldShow = !showComments;
    setShowComments(shouldShow);
    setShowReactions(false);
    if (!shouldShow || comments.length > 0 || loadingComments) return;

    setLoadingComments(true);
    try {
      setComments(await getPostComments(post.id));
    } catch {
      Alert.alert("Lỗi", "Không thể tải bình luận.");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    const content = commentText.trim();
    if (!content || submittingComment) return;

    setSubmittingComment(true);
    try {
      const comment = await createPostComment(post.id, content);
      setComments((current) => [...current, comment]);
      setCommentsCount((count) => count + 1);
      setCommentText("");
      onRefresh?.();
    } catch {
      Alert.alert("Lỗi", "Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Xóa bài viết", "Bạn chắc chắn muốn xóa bài viết này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => onDelete?.(post.id),
      },
    ]);
  };

  const handlePostActions = () => {
    Alert.alert("Bài viết", "Chọn hành động", [
      {
        text: "Chỉnh sửa",
        onPress: () => {
          router.push({
            pathname: "group/post/[id]/edit",
            params: { id: post.id },
          } as any);
        },
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: handleDelete,
      },
      {
        text: "Hủy",
        style: "cancel",
      },
    ]);
  };

  const topReactions = Object.entries(reactionSummary ?? {})
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type as ReactionType);

  return (
    <View style={styles.card} className="mb-3 rounded-2xl bg-surface p-4">
      {/* Header */}
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-row items-center gap-3">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/15">
              <Text className="text-sm font-bold text-primary">
                {avatarLetter}
              </Text>
            </View>
          )}
          <View>
            <Text className="text-sm font-semibold text-text-primary">
              {post.user.name}
            </Text>
            <Text className="text-xs text-text-secondary">
              {timeAgo(post.created_at)}
            </Text>
          </View>
        </View>
        {isOwn && (
          <TouchableOpacity
            onPress={handlePostActions}
            className="rounded-full p-1"
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {post.content && (
        <Text className="mb-3 text-sm leading-6 text-text-primary">
          {post.content}
        </Text>
      )}

      {/* Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-1 mb-3"
        >
          {post.attachments.map((uri, i) => {
            const imageUrl = getImageUrl(uri);

            if (!imageUrl) return null;

            return (
              <Image
                key={`${imageUrl}-${i}`}
                source={{ uri: imageUrl }}
                className="mx-1 h-48 w-64 rounded-xl bg-gray-100"
                resizeMode="cover"
              />
            );
          })}
        </ScrollView>
      )}

      {/* Reaction summary */}
      {(reactionsCount > 0 || commentsCount > 0) && (
        <View className="mb-3 flex-row items-center justify-between border-b border-border pb-2">
          <View className="flex-row items-center gap-1">
            {topReactions.map((r) => (
              <Text key={r} className="text-sm">
                {REACTION_EMOJIS[r]}
              </Text>
            ))}
            {reactionsCount > 0 && (
              <Text className="ml-1 text-xs text-text-secondary">
                {reactionsCount}
              </Text>
            )}
          </View>
          {commentsCount > 0 && (
            <TouchableOpacity onPress={handleToggleComments}>
              <Text className="text-xs text-text-secondary">
                {commentsCount} bình luận
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row items-center gap-4">
        <View className="relative">
          {showReactions && (
            <View
              style={styles.reactionPicker}
              className="absolute -top-14 left-0 z-10 flex-row gap-2 rounded-2xl bg-surface px-3 py-2"
            >
              {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleReact(type)}
                  className="items-center"
                >
                  <Text className="text-xl">{REACTION_EMOJIS[type]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity
            onPress={() => handleReact(userReaction ?? "like")}
            onLongPress={() => setShowReactions(true)}
            disabled={reacting}
            className="flex-row items-center gap-1.5"
            activeOpacity={0.7}
          >
            {userReaction ? (
              <Text className="text-lg">{REACTION_EMOJIS[userReaction]}</Text>
            ) : (
              <Ionicons name="thumbs-up-outline" size={18} color="#6B7280" />
            )}
            <Text
              className={`text-sm font-medium ${userReaction ? "text-primary" : "text-text-secondary"}`}
            >
              {userReaction
                ? userReaction === "like"
                  ? "Thích"
                  : userReaction === "love"
                    ? "Yêu thích"
                    : userReaction === "haha"
                      ? "Haha"
                      : userReaction === "wow"
                        ? "Wow"
                        : userReaction === "sad"
                          ? "Buồn"
                          : "Tức giận"
                : "Thích"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleToggleComments}
          className="flex-row items-center gap-1.5"
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={17} color="#6B7280" />
          <Text className="text-sm font-medium text-text-secondary">
            Bình luận
          </Text>
        </TouchableOpacity>
      </View>

      {showComments && (
        <View className="mt-4 border-t border-border pt-3">
          {loadingComments ? (
            <ActivityIndicator color="#4F46E5" />
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.id} className="mb-3 flex-row gap-2.5">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/15">
                  <Text className="text-xs font-bold text-primary">
                    {comment.user.name?.[0]?.toUpperCase() ?? "?"}
                  </Text>
                </View>
                <View className="flex-1 rounded-xl bg-muted px-3 py-2">
                  <Text className="text-xs font-semibold text-text-primary">
                    {comment.user.name}
                  </Text>
                  <Text className="mt-0.5 text-sm text-text-primary">
                    {comment.content}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="mb-3 text-center text-xs text-text-secondary">
              Chưa có bình luận nào.
            </Text>
          )}

          <View className="flex-row items-end gap-2">
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Viết bình luận..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={1000}
              className="max-h-24 flex-1 rounded-xl bg-muted px-3 py-2.5 text-sm text-text-primary"
            />
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || submittingComment}
              className={`h-10 w-10 items-center justify-center rounded-full ${
                commentText.trim() ? "bg-primary" : "bg-muted"
              }`}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons
                  name="send"
                  size={17}
                  color={commentText.trim() ? "white" : "#9CA3AF"}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  reactionPicker: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
});
