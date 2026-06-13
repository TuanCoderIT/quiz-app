import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFlashcardStore } from "../../src/features/flashcard/store";

const FLASHCARD_PRIMARY = "#4F46E5";

const getCategoryLabel = (deck: { category?: { name: string } | null }) =>
  deck.category?.name || "Flashcard";

const sourceLabels = {
  manual: "Thủ công",
  quiz_wrong_answers: "Câu sai",
  ai_generated: "AI",
} as const;

export default function FlashcardDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const deckId = Array.isArray(id) ? id[0] : id;

  const cachedDeck = useFlashcardStore((state) =>
    deckId
      ? state.decks.find((deck) => String(deck.id) === String(deckId))
      : undefined,
  );
  const detailDeck = useFlashcardStore((state) =>
    deckId ? state.deckDetails[String(deckId)] : undefined,
  );
  const isDetailLoading = useFlashcardStore((state) => state.isDetailLoading);
  const isStatusUpdating = useFlashcardStore((state) => state.isStatusUpdating);
  const error = useFlashcardStore((state) => state.error);
  const fetchDeckById = useFlashcardStore((state) => state.fetchDeckById);
  const publishDeck = useFlashcardStore((state) => state.publishDeck);
  const deleteDeck = useFlashcardStore((state) => state.deleteDeck);

  const deck = detailDeck || cachedDeck;

  useEffect(() => {
    if (deckId) {
      void fetchDeckById(deckId);
    }
  }, [deckId, fetchDeckById]);

  const renderState = ({
    icon,
    title,
    message,
    loading,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
    loading?: boolean;
  }) => (
    <View
      className="flex-1 bg-white items-center justify-center px-8"
      style={{ paddingTop: insets.top }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#4F46E5" />
      ) : (
        <Ionicons name={icon} size={46} color="#94A3B8" />
      )}
      <Text className="text-slate-900 text-xl font-bold mt-5">{title}</Text>
      <Text className="text-slate-500 text-center mt-2 leading-6">
        {message}
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-8 px-6 py-3 rounded-2xl border border-slate-200"
      >
        <Text className="text-slate-700 font-bold">Quay lại</Text>
      </TouchableOpacity>
    </View>
  );

  if (!deckId) {
    return renderState({
      icon: "alert-circle-outline",
      title: "Thiếu mã bộ thẻ",
      message: "Không tìm thấy mã bộ thẻ trong đường dẫn hiện tại.",
    });
  }

  if (isDetailLoading && !deck) {
    return renderState({
      icon: "layers-outline",
      title: "Đang tải bộ thẻ",
      message: "Đang lấy dữ liệu flashcard từ API.",
      loading: true,
    });
  }

  if (!deck) {
    return renderState({
      icon: "cloud-offline-outline",
      title: "Không tải được bộ thẻ",
      message:
        error || "Bộ thẻ này không tồn tại hoặc bạn chưa có quyền truy cập.",
    });
  }

  const canPublishDeck =
    deck.visibility === "private" && deck.status !== "archived";

  const handlePublishDeck = async () => {
    try {
      await publishDeck(deck.id);
      Alert.alert("Đã chia sẻ", "Bộ thẻ đã được chia sẻ công khai.");
    } catch (publishError) {
      const message =
        publishError instanceof Error
          ? publishError.message
          : "Không chia sẻ công khai được bộ thẻ này.";
      Alert.alert("Không chia sẻ được", message);
    }
  };

  const handleDeleteDeck = () => {
    Alert.alert(
      "Xóa bộ thẻ?",
      "Bộ thẻ sẽ bị xóa hoặc lưu trữ nếu backend không hỗ trợ xóa.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDeck(deck.id);
              router.replace("/(tabs)/flashcard");
            } catch (deleteError) {
              const message =
                deleteError instanceof Error
                  ? deleteError.message
                  : "Không xóa được bộ thẻ.";
              Alert.alert("Không xóa được", message);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[FLASHCARD_PRIMARY, "#111827"]}
        className="px-6 pb-8"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          {canPublishDeck ? (
            <TouchableOpacity
              onPress={handlePublishDeck}
              disabled={isStatusUpdating}
              className="px-4 py-2 bg-white rounded-full flex-row items-center"
            >
              {isStatusUpdating ? (
                <ActivityIndicator size="small" color={FLASHCARD_PRIMARY} />
              ) : (
                <Ionicons
                  name="share-social"
                  size={16}
                  color={FLASHCARD_PRIMARY}
                />
              )}
              <Text
                className="font-bold ml-2"
                style={{ color: FLASHCARD_PRIMARY }}
              >
                Chia sẻ công khai
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/flashcard/study",
                  params: { id: deck.id },
                })
              }
              className="px-4 py-2 bg-white rounded-full flex-row items-center"
            >
              <Ionicons name="play" size={16} color={FLASHCARD_PRIMARY} />
              <Text
                className="font-bold ml-2"
                style={{ color: FLASHCARD_PRIMARY }}
              >
                Học ngay
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row mb-6">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/flashcard/edit" as never,
                params: { id: deck.id },
              })
            }
            className="flex-1 bg-white/15 rounded-2xl py-3 mr-3 flex-row items-center justify-center"
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <Text className="text-white font-bold ml-2">Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteDeck}
            disabled={isStatusUpdating}
            className="flex-1 bg-white/15 rounded-2xl py-3 flex-row items-center justify-center"
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            <Text className="text-white font-bold ml-2">Xóa</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-white/75 text-sm font-bold uppercase tracking-widest mb-3">
          {getCategoryLabel(deck)}
        </Text>
        <Text className="text-white text-3xl font-bold leading-10 mb-3">
          {deck.title}
        </Text>
        <Text className="text-white/80 text-base leading-6">
          {deck.description}
        </Text>

        <View className="flex-row flex-wrap mt-5">
          <View className="bg-white/15 rounded-full px-3 py-1.5 mr-2 mb-2">
            <Text className="text-white/90 text-xs font-bold">
              {getCategoryLabel(deck)}
            </Text>
          </View>
          <View className="bg-white/15 rounded-full px-3 py-1.5 mr-2 mb-2">
            <Text className="text-white/90 text-xs font-bold">
              {deck.sourceType
                ? sourceLabels[deck.sourceType as keyof typeof sourceLabels] ||
                  deck.sourceType
                : "Thủ công"}
            </Text>
          </View>
          <View className="bg-white/15 rounded-full px-3 py-1.5 mr-2 mb-2">
            <Text className="text-white/90 text-xs font-bold">
              {deck.visibility}
            </Text>
          </View>
          {deck.status ? (
            <View className="bg-white/15 rounded-full px-3 py-1.5 mr-2 mb-2">
              <Text className="text-white/90 text-xs font-bold">
                {deck.status}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row mt-7">
          <View className="flex-1 bg-white/15 rounded-3xl p-4 mr-3">
            <Text className="text-white text-2xl font-bold">
              {deck.cardCount}
            </Text>
            <Text className="text-white/70 text-xs font-semibold mt-1">
              Tổng thẻ
            </Text>
          </View>
          <View className="flex-1 bg-white/15 rounded-3xl p-4 mr-3">
            <Text className="text-white text-2xl font-bold">
              {deck.masteredCount}
            </Text>
            <Text className="text-white/70 text-xs font-semibold mt-1">
              Đã thuộc
            </Text>
          </View>
          <View className="flex-1 bg-white/15 rounded-3xl p-4">
            <Text className="text-white text-2xl font-bold">
              {deck.dueCount}
            </Text>
            <Text className="text-white/70 text-xs font-semibold mt-1">
              Cần ôn
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View className="px-6 py-6">
        <Text className="text-slate-900 text-xl font-bold mb-4">
          Danh sách thẻ
        </Text>

        {deck.cards.length > 0 ? (
          deck.cards.map((card, index) => (
            <Animated.View
              key={card.id}
              entering={FadeInUp.delay(index * 70).duration(420)}
            >
              <View className="bg-white rounded-3xl p-5 mb-4 border border-slate-100">
                <View className="flex-row items-start justify-between mb-3">
                  <Text className="text-slate-400 font-bold">#{index + 1}</Text>
                  {card.progress?.status ? (
                    <View className="px-3 py-1 rounded-full bg-slate-100">
                      <Text className="text-slate-500 text-xs font-bold">
                        {card.progress.status}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text className="text-slate-900 text-lg font-bold mb-2">
                  {card.term}
                </Text>
                <Text className="text-slate-600 leading-6">
                  {card.definition}
                </Text>
                {card.explanation ? (
                  <Text className="text-slate-400 leading-6 mt-3">
                    {card.explanation}
                  </Text>
                ) : null}
              </View>
            </Animated.View>
          ))
        ) : (
          <View className="bg-white rounded-3xl p-8 items-center border border-slate-100">
            <Ionicons name="file-tray-outline" size={40} color="#94A3B8" />
            <Text className="text-slate-900 font-bold mt-4">Chưa có thẻ</Text>
            <Text className="text-slate-500 text-center mt-2">
              API chưa trả về danh sách thẻ cho bộ này.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
