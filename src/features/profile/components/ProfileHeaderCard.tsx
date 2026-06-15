import { Image } from "expo-image";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getImageUrl } from "@/src/utils/image";

type Props = {
  user: any;
};

export default function ProfileHeaderCard({ user }: Props) {
  const avatarUrl = getImageUrl(user?.avatar);

  return (
    <View className="rounded-3xl bg-white p-5">
      <View className="flex-row items-center">
        <Image
          source={avatarUrl || require("@/assets/images/default_avatar.png")}
          className="h-20 w-20 rounded-2xl bg-gray-100"
          contentFit="cover"
          transition={200}
        />

        <View className="ml-4 flex-1">
          <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>
            {user?.name || "Người dùng"}
          </Text>

          {user?.email ? (
            <Text className="mt-1 text-sm text-gray-500" numberOfLines={1}>
              {user.email}
            </Text>
          ) : null}

          <View className="mt-3 flex-row items-center">
            <View className="mr-2 rounded-full bg-indigo-50 px-3 py-1">
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
        </View>

        <Ionicons name="person-circle-outline" size={28} color="#CBD5E1" />
      </View>
    </View>
  );
}