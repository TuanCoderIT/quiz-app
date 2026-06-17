import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

import { getImageUrl } from "@/src/utils/image";

type Props = {
  user: any;
  showFullInfo: boolean;
  onToggleFullInfo: () => void;
  onEdit: () => void;
};

export default function ProfileHeaderCard({
  user,
  showFullInfo,
  onToggleFullInfo,
  onEdit,
}: Props) {
  const avatarUrl = getImageUrl(user?.avatar);

  return (
    <View className="rounded-3xl bg-white p-6 shadow-blue-300 shadow-xl">
      <View className="items-center">
        <Image
          source={
            avatarUrl
              ? { uri: avatarUrl }
              : require("@/assets/images/default_avatar.png")
          }
          className="h-28 w-28 rounded-full bg-gray-100"
          resizeMode="cover"
        />

        <Text
          className="mt-4 text-2xl font-bold text-gray-900"
          numberOfLines={1}
        >
          {user?.name || "Người dùng"}
        </Text>

        {user?.email ? (
          <Text className="mt-1 text-sm text-gray-500" numberOfLines={1}>
            {user.email}
          </Text>
        ) : null}

        <View className="mt-4 flex-row items-center gap-2">
          <View className="rounded-full bg-indigo-50 px-3 py-1">
            <Text className="text-xs font-semibold text-indigo-600">
              {user?.xp ?? 0} XP
            </Text>
          </View>

          <View className="rounded-full bg-orange-50 px-3 py-1">
            <Text className="text-xs font-semibold text-orange-600">
              🔥 {user?.current_streak ?? 0} ngày
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <Pressable
            onPress={onToggleFullInfo}
            className="h-11 flex-row items-center rounded-2xl bg-gray-100 px-4"
          >
            <Ionicons
              name={showFullInfo ? "chevron-up" : "chevron-down"}
              size={18}
              color="#374151"
            />
            <Text className="ml-2 font-semibold text-gray-700">
              {showFullInfo ? "Thu gọn" : "Xem đầy đủ"}
            </Text>
          </Pressable>

          <Pressable
            onPress={onEdit}
            className="h-11 flex-row items-center rounded-2xl bg-indigo-600 px-4"
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <Text className="ml-2 font-semibold text-white">Chỉnh sửa</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
