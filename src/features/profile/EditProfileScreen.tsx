import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuthStore } from "@/src/features/auth/store";
import { getImageUrl } from "@/src/utils/image";
import { updateProfile } from "./api";

export default function EditProfileScreen() {
  const { user, refreshUser } = useAuthStore();

  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);
  const [saving, setSaving] = useState(false);

  const isLocalImage =
    avatar?.startsWith("file:") ||
    avatar?.startsWith("content://") ||
    avatar?.startsWith("ph:") ||
    avatar?.startsWith("assets-library:");

  const avatarUrl = isLocalImage ? avatar : getImageUrl(avatar);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Thông báo", "Bạn cần cấp quyền truy cập thư viện ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên không được để trống.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name.trim());

      if (avatar && isLocalImage) {
        const filename = avatar.split("/").pop() ?? "avatar.jpg";
        const fileType = filename.toLowerCase().endsWith(".png")
          ? "image/png"
          : "image/jpeg";

        formData.append("avatar", {
          uri: avatar,
          name: filename,
          type: fileType,
        } as any);
      }

      await updateProfile(formData);
      await refreshUser?.();

      Alert.alert("Thành công", "Đã cập nhật hồ sơ.");
      router.back();
    } catch (error: any) {
      console.log("Lỗi cập nhật hồ sơ:", error?.response?.data ?? error);
      Alert.alert("Lỗi", "Không thể cập nhật hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between bg-white px-5 pb-4 pt-12">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>

        <Text className="text-lg font-bold text-gray-900">Chỉnh sửa hồ sơ</Text>

        <View className="h-10 w-10" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        <View className="items-center mt-10">
          <Pressable onPress={pickAvatar} className="relative">
            <Image
              source={
                avatarUrl
                  ? { uri: avatarUrl }
                  : require("@/assets/images/default_avatar.png")
              }
              className="h-28 w-28 rounded-full bg-gray-200"
              contentFit="cover"
            />

            <View className="absolute bottom-1 right-1 h-9 w-9 items-center justify-center rounded-full bg-indigo-600">
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </View>
          </Pressable>

          <Text className="mt-3 text-sm text-gray-500">
            Nhấn để đổi ảnh đại diện
          </Text>
        </View>

        <View className="mt-8 rounded-2xl bg-white p-4">
          <Text className="mb-2 text-sm font-semibold text-gray-700">
            Tên hiển thị
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên của bạn"
            className="rounded-xl bg-gray-50 px-4 py-3 text-base text-gray-900"
          />

          {user?.email ? (
            <>
              <Text className="mb-2 mt-5 text-sm font-semibold text-gray-700">
                Email
              </Text>

              <View className="rounded-xl bg-gray-50 px-4 py-3">
                <Text className="text-base text-gray-500">{user.email}</Text>
              </View>
            </>
          ) : null}
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          className={`mt-6 h-12 items-center justify-center rounded-2xl ${
            saving ? "bg-indigo-300" : "bg-indigo-600"
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-bold text-white">Lưu thay đổi</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
