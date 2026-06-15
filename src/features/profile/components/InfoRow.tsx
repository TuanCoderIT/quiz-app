import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

export default function InfoRow({ icon, label, value }: Props) {
  return (
    <View className="mb-3 flex-row items-center">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
        <Ionicons name={icon} size={17} color="#6B7280" />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-xs text-gray-500">{label}</Text>
        <Text className="mt-0.5 text-sm font-semibold text-gray-900">
          {value}
        </Text>
      </View>
    </View>
  );
}