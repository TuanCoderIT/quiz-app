import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from "react-native";

type Props = {
  disabled?: boolean;
  sending?: boolean;
  onSend: (content: string) => Promise<void>;
  onTyping: () => void;
};

export default function ChatInput({
  disabled,
  sending,
  onSend,
  onTyping,
}: Props) {
  const [content, setContent] = useState("");

  const handleSend = async () => {
    if (!content.trim()) return;

    const value = content.trim();
    setContent("");

    await onSend(value);
  };

  return (
    <View className="border-t border-gray-100 bg-white px-4 pb-5 pt-3">
      <View className="flex-row items-end rounded-2xl bg-gray-100 px-4 py-2">
        <TextInput
          value={content}
          onChangeText={(text) => {
            setContent(text);
            onTyping();
          }}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#9CA3AF"
          multiline
          editable={!disabled && !sending}
          className="max-h-28 flex-1 py-2 text-base text-gray-900"
        />

        <Pressable
          onPress={handleSend}
          disabled={sending || !content.trim()}
          className={`ml-2 h-10 w-10 items-center justify-center rounded-full ${
            content.trim() ? "bg-indigo-600" : "bg-gray-300"
          }`}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={18} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </View>
  );
}