import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InfoRow from "./InfoRow";

type Props = {
  user: any;
  onEdit: () => void;
};

function getGenderLabel(gender?: string) {
  if (gender === "male") return "Nam";
  if (gender === "female") return "Nữ";
  if (gender === "other") return "Khác";
  return "Chưa cập nhật";
}

export default function PersonalInfoCard({ user, onEdit }: Props) {
  return (
    <View className="mt-4 rounded-3xl bg-white p-5">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900">
          Thông tin cá nhân
        </Text>

        <Pressable
          onPress={onEdit}
          className="h-9 w-9 items-center justify-center rounded-full bg-indigo-50"
        >
          <Ionicons name="create-outline" size={18} color="#4F46E5" />
        </Pressable>
      </View>

      {user?.bio ? (
        <Text className="mb-4 leading-5 text-gray-500">{user.bio}</Text>
      ) : (
        <Text className="mb-4 text-sm text-gray-400">
          Hoàn thiện hồ sơ để cá nhân hóa trải nghiệm học tập.
        </Text>
      )}

      <InfoRow
        icon="person-outline"
        label="Giới tính"
        value={getGenderLabel(user?.gender)}
      />

      <InfoRow
        icon="calendar-outline"
        label="Ngày sinh"
        value={user?.date_of_birth || "Chưa cập nhật"}
      />

      <InfoRow
        icon="call-outline"
        label="Số điện thoại"
        value={user?.phone_number || "Chưa cập nhật"}
      />
    </View>
  );
}