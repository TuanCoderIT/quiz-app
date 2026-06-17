import { getImageUrl } from "@/src/utils/image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { updateProfile } from "../api";
import ProfileInput from "./ProfileInput";
import { formatDate } from "@/src/utils/formatDate";

type Props = {
  user: any;
  onCancel: () => void;
  onSuccess: () => void;
};

export default function EditProfileForm({ user, onCancel, onSuccess }: Props) {
  const [name, setName] = useState(user?.name ?? "");
  const [gender, setGender] = useState(user?.gender ?? "other");
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isLocalImage =
    avatar?.startsWith("file:") || avatar?.startsWith("content:");

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
      Alert.alert("Lỗi", "Họ và tên không được để trống.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("gender", gender);
      formData.append("date_of_birth", dateOfBirth);
      formData.append("phone_number", phoneNumber);
      formData.append("bio", bio);

      if (isLocalImage && avatar) {
        formData.append("avatar", {
          uri: avatar,
          name: "avatar.jpg",
          type: "image/jpeg",
        } as any);
      }

      await updateProfile(formData);

      Alert.alert("Thành công", "Đã cập nhật hồ sơ.");
      onSuccess();
    } catch (error: any) {
      console.log("Lỗi cập nhật hồ sơ:", error?.response?.data ?? error);
      Alert.alert("Lỗi", "Không thể cập nhật hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (selectedDate) {
      const formatted = selectedDate.toISOString().split("T")[0];
      setDateOfBirth(formatted);
    }
  };

  return (
    <View className="mt-4 rounded-3xl bg-white p-5 shadow-blue-400 shadow-xl">
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900">
          Chỉnh sửa thông tin
        </Text>

        <Pressable onPress={onCancel}>
          <Ionicons name="close" size={22} color="#6B7280" />
        </Pressable>
      </View>

      <View className="items-center mt-6">
        <Pressable onPress={pickAvatar} className="relative">
          <Image
            source={
              avatarUrl
                ? { uri: avatarUrl }
                : require("@/assets/images/default_avatar.png")
            }
            className="h-24 w-24 rounded-full bg-gray-100"
          />
          <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full bg-indigo-600">
            <Ionicons name="camera" size={17} color="#FFFFFF" />
          </View>
        </Pressable>

        <Text className="mt-2 text-sm text-gray-500">
          Nhấn để đổi ảnh đại diện
        </Text>
      </View>

      <ProfileInput
        label="Họ và tên"
        value={name}
        onChangeText={setName}
        placeholder="Nhập họ và tên"
      />

      <Text className="mb-2 mt-4 text-sm font-semibold text-gray-700">
        Giới tính
      </Text>

      <View className="flex-row gap-2">
        {[
          { label: "Nam", value: "male" },
          { label: "Nữ", value: "female" },
          { label: "Khác", value: "other" },
        ].map((item) => (
          <Pressable
            key={item.value}
            onPress={() => setGender(item.value)}
            className={`flex-1 rounded-xl py-3 ${
              gender === item.value ? "bg-indigo-600" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                gender === item.value ? "text-white" : "text-gray-600"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text className="mb-2 mt-4 text-sm font-semibold text-gray-700">
        Ngày sinh
      </Text>

      <Pressable
        onPress={() => setShowDatePicker(true)}
        className="h-14 justify-center rounded-2xl border border-gray-200 bg-gray-50 px-4"
      >
        <Text className={dateOfBirth ? "text-gray-900" : "text-gray-400"}>
          {formatDate(dateOfBirth)}
        </Text>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth ? new Date(dateOfBirth) : new Date(2000, 0, 1)}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      <ProfileInput
        label="Số điện thoại"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Nhập số điện thoại"
        keyboardType="phone-pad"
      />

      <ProfileInput
        label="Giới thiệu"
        value={bio}
        onChangeText={setBio}
        placeholder="Nói vài dòng về bạn..."
        multiline
      />

      <View className="mt-5 flex-row gap-3">
        <Pressable
          onPress={onCancel}
          disabled={saving}
          className="h-12 flex-1 items-center justify-center rounded-2xl bg-gray-100"
        >
          <Text className="font-bold text-gray-700">Hủy</Text>
        </Pressable>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          className={`h-12 flex-1 items-center justify-center rounded-2xl ${
            saving ? "bg-indigo-300" : "bg-indigo-600"
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-bold text-white">Lưu</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
