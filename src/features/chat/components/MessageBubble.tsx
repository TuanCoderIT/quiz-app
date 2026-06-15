import { Text, View } from "react-native";
import { ChatMessage } from "../chat.types";

type Props = {
  message: ChatMessage;
  isOwn: boolean;
  showName?: boolean;
};

export default function MessageBubble({ message, isOwn, showName }: Props) {
  return (
    <View className={`mb-3 ${isOwn ? "items-end" : "items-start"}`}>
      {!isOwn && showName ? (
        <Text className="mb-1 ml-2 text-xs font-semibold text-gray-500">
          {message.user?.name ?? "Người dùng"}
        </Text>
      ) : null}

      <View
        className={`max-w-[78%] rounded-2xl px-4 py-3 ${
          isOwn
            ? "rounded-br-md bg-indigo-600"
            : "rounded-bl-md bg-white"
        }`}
      >
        <Text
          className={`text-[15px] leading-5 ${
            isOwn ? "text-white" : "text-gray-900"
          }`}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}