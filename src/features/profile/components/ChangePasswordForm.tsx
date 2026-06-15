import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ProfileInput from "./ProfileInput";
import { changePassword } from "../api";

type Props = {
  onCancel: () => void;
  onSuccess: () => void;
};

export default function ChangePasswordForm({ onCancel, onSuccess }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !newPasswordConfirmation) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      Alert.alert("Lỗi", "Xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      setSaving(true);

      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });

      Alert.alert("Thành công", "Đã đổi mật khẩu.");
      onSuccess();
    } catch (error: any) {
      console.log("Lỗi đổi mật khẩu:", error?.response?.data ?? error);
      Alert.alert("Lỗi", "Không thể đổi mật khẩu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="mt-4 rounded-3xl bg-white p-5">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900">
          Đổi mật khẩu
        </Text>

        <Pressable onPress={onCancel}>
          <Ionicons name="close" size={22} color="#6B7280" />
        </Pressable>
      </View>

      <ProfileInput
        label="Mật khẩu hiện tại"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Nhập mật khẩu hiện tại"
        secureTextEntry
      />

      <ProfileInput
        label="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Ít nhất 8 ký tự"
        secureTextEntry
      />

      <ProfileInput
        label="Xác nhận mật khẩu mới"
        value={newPasswordConfirmation}
        onChangeText={setNewPasswordConfirmation}
        placeholder="Nhập lại mật khẩu mới"
        secureTextEntry
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
          onPress={handleChangePassword}
          disabled={saving}
          className={`h-12 flex-1 items-center justify-center rounded-2xl ${
            saving ? "bg-indigo-300" : "bg-indigo-600"
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-bold text-white">Cập nhật</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}