import { Text, View } from "react-native";
import InfoRow from "./InfoRow";
import { formatDate } from "@/src/utils/formatDate";

type Props = {
  user: any;
};

function getGenderLabel(gender?: string) {
  if (gender === "male") return "Nam";
  if (gender === "female") return "Nữ";
  if (gender === "other") return "Khác";
  return "Chưa cập nhật";
}

export default function PersonalInfoCard({ user }: Props) {
  return (
    <View className="mt-4 rounded-3xl bg-white p-5">
      <Text className="mb-4 text-lg font-bold text-gray-900">
        Thông tin cá nhân
      </Text>

      {user?.bio ? (
        <Text className="mb-4 leading-5 text-gray-500">Bio: {user.bio}</Text>
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
        value={formatDate(user?.dateOfBirth) || "Chưa cập nhật"}
      />

      <InfoRow
        icon="call-outline"
        label="Số điện thoại"
        value={user?.phone_number || "Chưa cập nhật"}
      />
    </View>
  );
}
