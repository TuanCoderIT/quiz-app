import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import PostEditor from "../components/PostEditor";
import { getPost, updatePost } from "../post.api";
import { Post } from "../post.types";

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const postId = Number(id);

  const [post, setPost] = useState<Post | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      if (!postId) return;

      try {
        setLoadingPost(true);
        const result = await getPost(postId);
        setPost(result);
      } catch (error) {
        console.log("Load post error:", error);
        Alert.alert("Lỗi", "Không thể tải bài viết.");
      } finally {
        setLoadingPost(false);
      }
    };

    loadPost();
  }, [postId]);

  const handleSubmit = async (content: string, attachments: string[]) => {
    if (!postId) return;

    try {
      setSubmitting(true);

      await updatePost(postId, {
        content: content || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        visibility: post?.visibility ?? "group_only",
      });

      Alert.alert("Thành công", "Đã cập nhật bài viết.");
      router.back();
    } catch (error: any) {
      console.log("Update post error:", error?.response?.data ?? error);
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Không thể cập nhật bài viết."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPost) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
        <Text className="mt-3 text-gray-500">Đang tải bài viết...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center border-b border-gray-100 bg-white px-4 pb-4 pt-12">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-gray-900">
            Chỉnh sửa bài viết
          </Text>
          <Text className="text-sm text-gray-500">Cập nhật nội dung bài viết</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <PostEditor
          initialContent={post?.content}
          initialAttachments={post?.attachments}
          submitting={submitting}
          submitLabel="Lưu thay đổi"
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </View>
  );
}