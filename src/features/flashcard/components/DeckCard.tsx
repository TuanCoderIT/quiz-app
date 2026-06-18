import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AppCard } from "@/src/components/common/GlassCard";
import { useFlashcardStore } from "../store";
import type { FlashcardDeck } from "../types";

const FLASHCARD_PRIMARY = "#4F46E5";

type Props = {
  deck: FlashcardDeck;
  index: number;
};

function getProgress(deck: FlashcardDeck) {
  if (!deck.cardCount) return 0;
  return Math.round((deck.masteredCount / deck.cardCount) * 100);
}

export function DeckCard({ deck, index }: Props) {
  const router = useRouter();
  const progress = getProgress(deck);
  const deleteDeck = useFlashcardStore((state) => state.deleteDeck);
  const fetchDecks = useFlashcardStore((state) => state.fetchDecks);

  const openDeck = () => router.push(`/flashcard/${deck.id}`);
  const startStudy = () =>
    router.push({ pathname: "/flashcard/study", params: { id: deck.id } });

  const editDeck = () =>
    router.push({
      pathname: "/flashcard/edit" as never,
      params: { id: deck.id },
    });

  const handleDelete = () => {
    Alert.alert("Xóa bộ thẻ?", "Bạn có chắc chắn muốn xóa bộ thẻ này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDeck(deck.id);
            void fetchDecks();
          } catch {
            Alert.alert("Không xóa được", "Vui lòng thử lại sau.");
          }
        },
      },
    ]);
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 90).duration(500)}
      className="mb-4"
    >
      <AppCard>
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text
              className="text-lg font-bold text-slate-950"
              numberOfLines={1}
            >
              {deck.title}
            </Text>
            <Text className="mt-1 text-sm text-slate-500">
              {deck.cardCount} thẻ
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={editDeck}
              className="h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 active:opacity-80"
            >
              <Ionicons name="create-outline" size={18} color="#0F172A" />
            </Pressable>

            <Pressable
              onPress={handleDelete}
              className="h-10 w-10 items-center justify-center rounded-full border border-red-100 bg-red-50 active:opacity-80"
            >
              <Ionicons name="trash-outline" size={19} color="#EF4444" />
            </Pressable>
          </View>
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-slate-700">
            {progress}% đã thuộc
          </Text>
          <Text className="text-sm text-slate-500">
            {deck.masteredCount}/{deck.cardCount} thẻ
          </Text>
        </View>

        <View className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <View
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: FLASHCARD_PRIMARY,
            }}
          />
        </View>

        <View className="mt-5 flex-row gap-3">
          <Pressable
            onPress={startStudy}
            className="h-12 flex-1 items-center justify-center rounded-md bg-indigo-600 active:opacity-90"
          >
            <Text className="text-[15px] font-bold text-white">Bắt đầu</Text>
          </Pressable>

          <Pressable
            onPress={openDeck}
            className="h-12 flex-1 items-center justify-center rounded-md border border-indigo-600 bg-white active:opacity-85"
          >
            <Text className="text-[15px] font-bold text-indigo-600">
              Chi tiết
            </Text>
          </Pressable>
        </View>
      </AppCard>
    </Animated.View>
  );
}
