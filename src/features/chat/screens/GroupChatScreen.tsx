import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
// import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { KeyboardStickyView } from "react-native-keyboard-controller";

import { ChatMessage } from "../chat.types";
import ChatInput from "../components/ChatInput";
import MessageBubble from "../components/MessageBubble";
import TypingIndicator from "../components/TypingIndicator";
import { useGroupChat } from "../hooks/useGroupChat";

import { useAuthStore } from "@/src/features/auth/store";
import { getGroupDetail } from "@/src/features/group/group.api";
import { GroupDetail } from "@/src/features/group/group.types";

export default function GroupChatScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const user = useAuthStore((state) => state.user);

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);

  useEffect(() => {
    const loadGroup = async () => {
      if (!slug) return;

      try {
        setLoadingGroup(true);
        const result = await getGroupDetail(slug);
        setGroup(result);
      } catch (error) {
        console.log("Load group detail error:", error);
      } finally {
        setLoadingGroup(false);
      }
    };

    loadGroup();
  }, [slug]);

  const { messages, typingUsers, loading, sending, sendMessage, sendTyping } =
    useGroupChat(group?.id, user?.id);

  const renderMessage = ({
    item,
    index,
  }: {
    item: ChatMessage;
    index: number;
  }) => {
    const previous = messages[index - 1];
    const isOwn = item.user_id === user?.id;
    const showName = !previous || previous.user_id !== item.user_id;

    return <MessageBubble message={item} isOwn={isOwn} showName={showName} />;
  };

  if (loadingGroup || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
        <Text className="mt-3 text-gray-500">Đang tải chat...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center border-b border-gray-100 bg-white px-4 pb-4 pt-12">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
            Chat nhóm
          </Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {group?.name}
          </Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 16,
        }}
        ListEmptyComponent={
          <View className="mt-20 items-center">
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={42}
              color="#CBD5E1"
            />
            <Text className="mt-3 text-center text-gray-500">
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
            </Text>
          </View>
        }
      />

      <KeyboardStickyView>
        <View className="bg-white">
          <TypingIndicator users={typingUsers} />

          <ChatInput
            sending={sending}
            onSend={sendMessage}
            onTyping={sendTyping}
          />
        </View>
      </KeyboardStickyView>
    </View>
  );
}
