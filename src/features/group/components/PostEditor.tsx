import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image as RNImage,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { getImageUrl } from "@/src/utils/image";

type AttachmentItem = {
  id: string;
  previewUri: string;
  value: string;
};

type Props = {
  initialContent?: string | null;
  initialAttachments?: string[] | null;
  submitting?: boolean;
  submitLabel?: string;
  placeholder?: string;
  onSubmit: (content: string, attachments: string[]) => Promise<void>;
};

export default function PostEditor({
  initialContent = "",
  initialAttachments = [],
  submitting = false,
  submitLabel = "Đăng",
  placeholder = "Bạn đang nghĩ gì?",
  onSubmit,
}: Props) {
  const [content, setContent] = useState(initialContent ?? "");
  const [attachments, setAttachments] = useState<AttachmentItem[]>(
    (initialAttachments ?? []).map((url, index) => ({
      id: `old-${index}-${url}`,
      value: url,
      previewUri: getImageUrl(url) ?? url,
    }))
  );

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Thông báo", "Bạn cần cấp quyền truy cập thư viện ảnh.");
      return;
    }

    const remainingSlots = 4 - attachments.length;

    if (remainingSlots <= 0) {
      Alert.alert("Thông báo", "Bạn chỉ có thể chọn tối đa 4 ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75,
      base64: true,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
    });

    if (result.canceled) return;

    const selected = result.assets
      .filter((asset) => asset.uri && asset.base64)
      .map((asset, index) => {
        const mimeType = asset.mimeType || "image/jpeg";

        return {
          id: `${Date.now()}-${index}`,
          previewUri: asset.uri,
          value: `data:${mimeType};base64,${asset.base64}`,
        };
      });

    setAttachments((prev) => [...prev, ...selected].slice(0, 4));
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung hoặc chọn ảnh.");
      return;
    }

    await onSubmit(
      content.trim(),
      attachments.map((item) => item.value)
    );
  };

  return (
    <View className="rounded-3xl bg-white p-4">
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
        className="min-h-32 text-base leading-6 text-gray-900"
      />

      {attachments.length > 0 ? (
        <View className="mt-4 flex-row flex-wrap gap-3">
          {attachments.map((item) => (
            <View key={item.id} className="relative">
              <RNImage
                source={{ uri: item.previewUri }}
                className="h-24 w-24 rounded-2xl bg-gray-100"
                resizeMode="cover"
              />

              <Pressable
                onPress={() => removeAttachment(item.id)}
                className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full bg-red-500"
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View className="mt-5 flex-row items-center justify-between border-t border-gray-100 pt-4">
        <Pressable
          onPress={pickImage}
          disabled={attachments.length >= 4 || submitting}
          className="flex-row items-center rounded-full bg-gray-100 px-4 py-2"
        >
          <Ionicons name="image-outline" size={20} color="#4F46E5" />
          <Text className="ml-2 font-semibold text-gray-700">Thêm ảnh</Text>
        </Pressable>

        <Text className="text-sm text-gray-400">
          {attachments.length}/4 ảnh
        </Text>
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={submitting}
        className={`mt-5 h-12 items-center justify-center rounded-2xl ${
          submitting ? "bg-indigo-300" : "bg-indigo-600"
        }`}
      >
        <Text className="font-bold text-white">
          {submitting ? "Đang xử lý..." : submitLabel}
        </Text>
      </Pressable>
    </View>
  );
}