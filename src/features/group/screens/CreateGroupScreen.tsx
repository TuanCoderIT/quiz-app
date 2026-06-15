import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createGroup } from "../group.api";

type Visibility = "public" | "private";

export default function CreateGroupScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length >= 3 && !loading;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Cần quyền truy cập", "Vui lòng cấp quyền truy cập thư viện ảnh.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      if (coverImage) {
        const formData = new FormData();
        formData.append("name", name.trim());
        if (description.trim()) formData.append("description", description.trim());
        formData.append("visibility", visibility);
        const filename = coverImage.split("/").pop() ?? "cover.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
        formData.append("cover_image", {
          uri: coverImage,
          name: filename,
          type: `image/${ext === "jpg" ? "jpeg" : ext}`,
        } as any);
        await createGroup(formData);
      } else {
        await createGroup({
          name: name.trim(),
          description: description.trim() || undefined,
          visibility,
        });
      }
      router.back();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Không thể tạo nhóm. Vui lòng thử lại.";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border px-5 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-base text-text-secondary">Hủy</Text>
          </TouchableOpacity>
          <Text className="text-base font-semibold text-text-primary">
            Tạo nhóm mới
          </Text>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!canSubmit}
            className={`rounded-full px-4 py-2 ${canSubmit ? "bg-primary" : "bg-muted"}`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text
                className={`text-sm font-semibold ${
                  canSubmit ? "text-white" : "text-text-secondary"
                }`}
              >
                Tạo
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Cover image picker */}
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.85}
            className="mx-5 mt-5 h-40 items-center justify-center overflow-hidden rounded-2xl bg-muted"
          >
            {coverImage ? (
              <>
                <Image
                  source={{ uri: coverImage }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 items-center justify-center bg-black/30">
                  <Ionicons name="camera" size={28} color="white" />
                  <Text className="mt-1 text-xs font-medium text-white">
                    Đổi ảnh bìa
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Ionicons name="image-outline" size={36} color="#9CA3AF" />
                <Text className="mt-2 text-sm text-text-secondary">
                  Thêm ảnh bìa nhóm
                </Text>
                <Text className="mt-0.5 text-xs text-text-secondary opacity-70">
                  Tỉ lệ 16:9 · Tùy chọn
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Form fields */}
          <View className="mt-5 px-5">
            {/* Group name */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-text-primary">
                Tên nhóm <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên nhóm..."
                placeholderTextColor="#9CA3AF"
                maxLength={80}
                className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary"
              />
              <Text className="mt-1 text-right text-xs text-text-secondary">
                {name.length}/80
              </Text>
              {name.length > 0 && name.trim().length < 3 && (
                <Text className="mt-1 text-xs text-red-500">
                  Tên nhóm phải có ít nhất 3 ký tự
                </Text>
              )}
            </View>

            {/* Description */}
            <View className="mb-5">
              <Text className="mb-1.5 text-sm font-medium text-text-primary">
                Mô tả nhóm
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả về mục đích và nội dung của nhóm..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
                className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary"
                style={{ minHeight: 96 }}
              />
              <Text className="mt-1 text-right text-xs text-text-secondary">
                {description.length}/500
              </Text>
            </View>

            {/* Visibility */}
            <View>
              <Text className="mb-2 text-sm font-medium text-text-primary">
                Quyền riêng tư
              </Text>
              <View className="gap-3">
                {(
                  [
                    {
                      value: "public",
                      icon: "earth-outline",
                      label: "Công khai",
                      desc: "Ai cũng có thể tìm thấy và tham gia nhóm",
                    },
                    {
                      value: "private",
                      icon: "lock-closed-outline",
                      label: "Riêng tư",
                      desc: "Cần được duyệt mới có thể tham gia nhóm",
                    },
                  ] as const
                ).map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setVisibility(opt.value)}
                    activeOpacity={0.8}
                    className={`flex-row items-center gap-4 rounded-xl border p-4 ${
                      visibility === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface"
                    }`}
                  >
                    <View
                      className={`h-10 w-10 items-center justify-center rounded-full ${
                        visibility === opt.value
                          ? "bg-primary/15"
                          : "bg-muted"
                      }`}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={20}
                        color={visibility === opt.value ? "#4F46E5" : "#6B7280"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-semibold ${
                          visibility === opt.value
                            ? "text-primary"
                            : "text-text-primary"
                        }`}
                      >
                        {opt.label}
                      </Text>
                      <Text className="mt-0.5 text-xs leading-4 text-text-secondary">
                        {opt.desc}
                      </Text>
                    </View>
                    <View
                      className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                        visibility === opt.value
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {visibility === opt.value && (
                        <Ionicons name="checkmark" size={12} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
