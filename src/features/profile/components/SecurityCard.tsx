import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onPress: () => void;
};

export default function SecurityCard({ onPress }: Props) {
  return (
    <View className="mt-4 rounded-3xl bg-white p-5">
      <View className="flex-row items-center">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
          <Ionicons name="lock-closed-outline" size={20} color="#4F46E5" />
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-gray-900">
            Bảo mật tài khoản
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Đổi mật khẩu để bảo vệ tài khoản của bạn.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onPress}
        className="mt-4 h-12 items-center justify-center rounded-2xl bg-gray-100"
      >
        <Text className="font-bold text-gray-700">Đổi mật khẩu</Text>
      </Pressable>
    </View>
  );
}