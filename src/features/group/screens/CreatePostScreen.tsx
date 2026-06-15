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
import { createPost } from "../post.api";
import { getGroupDetail } from "../group.api";
import { GroupDetail } from "../group.types";

export default function CreatePostScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadGroup = async () => {
      if (!slug) return;

      try {
        setLoadingGroup(true);
        const result = await getGroupDetail(slug);
        setGroup(result);
      } catch (error) {
        console.log("Load group error:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin nhóm.");
      } finally {
        setLoadingGroup(false);
      }
    };

    loadGroup();
  }, [slug]);

  const handleSubmit = async (content: string, attachments: string[]) => {
    if (!group?.id) {
      Alert.alert("Lỗi", "Không tìm thấy group_id.");
      return;
    }

    try {
      setSubmitting(true);

      await createPost({
        group_id: group.id,
        content: content || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        visibility: "group_only",
      });

      Alert.alert("Thành công", "Đã đăng bài viết.");
      router.back();
    } catch (error: any) {
      console.log("Create post error:", error?.response?.data ?? error);
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Không thể đăng bài viết."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingGroup) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
        <Text className="mt-3 text-gray-500">Đang tải...</Text>
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
          <Text className="text-lg font-bold text-gray-900">Tạo bài viết</Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {group?.name}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <PostEditor
          submitting={submitting}
          submitLabel="Đăng bài"
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </View>
  );
}