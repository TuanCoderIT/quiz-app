import { Text, View } from "react-native";
import { TypingUser } from "../chat.types";

type Props = {
  users: TypingUser[];
};

export default function TypingIndicator({ users }: Props) {
  if (users.length === 0) return null;

  const text =
    users.length === 1
      ? `${users[0].userName} đang nhập...`
      : `${users.length} người đang nhập...`;

  return (
    <View className="px-5 pb-2">
      <Text className="text-xs text-gray-500">{text}</Text>
    </View>
  );
}