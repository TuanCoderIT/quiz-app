import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFlashcardStore } from "../../src/features/flashcard/store";
import { FlashcardSetVisibility } from "../../src/features/flashcard/types";
import { getCategories } from "../../src/features/quiz/api";
import { Category } from "../../src/types/category";

type CardDraft = {
  id: string;
  cardId?: number | string;
  term: string;
  definition: string;
  explanation: string;
};

const createCardDraft = (): CardDraft => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  term: "",
  definition: "",
  explanation: "",
});

const toCategoryId = (value: number | string | undefined): number | null => {
  if (value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const logAxiosError = (error: unknown) => {
  if (isAxiosError(error)) {
    console.log(error.response?.status);
    console.log(JSON.stringify(error.response?.data, null, 2));
  }
};

export default function EditFlashcardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const deckId = Array.isArray(id) ? id[0] : id;

  const deck = useFlashcardStore((state) =>
    deckId ? state.deckDetails[String(deckId)] : undefined,
  );
  const cachedDeck = useFlashcardStore((state) =>
    deckId
      ? state.decks.find((item) => String(item.id) === String(deckId))
      : undefined,
  );
  const currentDeck = deck || cachedDeck;
  const isDetailLoading = useFlashcardStore((state) => state.isDetailLoading);
  const isStatusUpdating = useFlashcardStore((state) => state.isStatusUpdating);
  const fetchDeckById = useFlashcardStore((state) => state.fetchDeckById);
  const updateDeck = useFlashcardStore((state) => state.updateDeck);
  const addCard = useFlashcardStore((state) => state.addCard);
  const updateCard = useFlashcardStore((state) => state.updateCard);
  const deleteCard = useFlashcardStore((state) => state.deleteCard);
  const fetchDecks = useFlashcardStore((state) => state.fetchDecks);

  const [title, setTitle] = useState("");
  const [visibility, setVisibility] =
    useState<FlashcardSetVisibility>("private");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | string | undefined
  >();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<CardDraft[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (deckId) {
      void fetchDeckById(deckId);
    }
  }, [deckId, fetchDeckById]);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const nextCategories = await getCategories();
        if (mounted) {
          setCategories(
            nextCategories.filter((category) => String(category.id) !== "all"),
          );
        }
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      } finally {
        if (mounted) {
          setIsLoadingCategories(false);
        }
      }
    };

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentDeck) {
      return;
    }

    setTitle(currentDeck.title);
    setVisibility(currentDeck.visibility || "private");
    setSelectedCategoryId(currentDeck.categoryId);
    setCards(
      currentDeck.cards.map((card) => ({
        id: String(card.id),
        cardId: card.id,
        term: card.term,
        definition: card.definition,
        explanation: card.explanation || "",
      })),
    );
  }, [currentDeck]);

  const hasInvalidCard = useMemo(
    () => cards.some((card) => !card.term.trim() || !card.definition.trim()),
    [cards],
  );

  const updateDraftCard = (
    id: string,
    field: "term" | "definition" | "explanation",
    value: string,
  ) => {
    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === id ? { ...card, [field]: value } : card,
      ),
    );
  };

  const handleSave = async () => {
    if (!deckId || !currentDeck) {
      return;
    }

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      Alert.alert("Thiếu tên bộ thẻ", "Vui lòng nhập tên bộ thẻ.");
      return;
    }

    if (hasInvalidCard) {
      Alert.alert(
        "Thiếu nội dung thẻ",
        "Mỗi thẻ cần có thuật ngữ và định nghĩa.",
      );
      return;
    }

    setIsSaving(true);

    try {
      await updateDeck(deckId, {
        title: normalizedTitle,
        category_id: toCategoryId(selectedCategoryId),
        visibility,
      });

      for (const card of cards) {
        const payload = {
          term: card.term.trim(),
          definition: card.definition.trim(),
          explanation: card.explanation.trim() || null,
        };

        if (card.cardId) {
          await updateCard(card.cardId, payload);
        } else {
          await addCard(deckId, payload);
        }
      }

      await fetchDeckById(deckId);
      void fetchDecks();
      router.replace(`/flashcard/${deckId}`);
    } catch (error) {
      logAxiosError(error);
      console.error("Lỗi lưu bộ flashcard:", error);
      Alert.alert("Không lưu được", "Vui lòng kiểm tra dữ liệu và thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = (card: CardDraft) => {
    if (cards.length === 1) {
      Alert.alert("Không thể xóa", "Bộ thẻ cần ít nhất một thẻ.");
      return;
    }

    if (!card.cardId) {
      setCards((currentCards) =>
        currentCards.filter((item) => item.id !== card.id),
      );
      return;
    }

    Alert.alert("Xóa thẻ?", "Thẻ này sẽ bị xóa khỏi bộ thẻ.", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCard(card.cardId as number | string, deckId);
            setCards((currentCards) =>
              currentCards.filter((item) => item.id !== card.id),
            );
          } catch (error) {
            logAxiosError(error);
            Alert.alert("Không xóa được thẻ", "Vui lòng thử lại sau.");
          }
        },
      },
    ]);
  };

  if (!deckId || (isDetailLoading && !currentDeck)) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <ActivityIndicator color="#4F46E5" />
        <Text className="text-slate-500 font-bold mt-4">
          Đang tải bộ thẻ...
        </Text>
      </SafeAreaView>
    );
  }

  if (!currentDeck) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Ionicons name="cloud-offline-outline" size={42} color="#94A3B8" />
        <Text className="text-slate-900 text-xl font-bold mt-4">
          Không tìm thấy bộ thẻ
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 px-5 py-3 rounded-2xl bg-white border border-slate-200"
        >
          <Text className="text-slate-700 font-bold">Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="h-16 px-5 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-11 h-11 rounded-2xl bg-white border border-slate-200 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </Pressable>
          <Text className="text-slate-900 text-lg font-extrabold">
            Sửa bộ thẻ
          </Text>
          <View className="w-11" />
        </View>

        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="px-5 pb-32">
            <Text className="text-slate-900 text-[15px] font-extrabold mb-2.5">
              Tên bộ thẻ
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Tên bộ thẻ"
              placeholderTextColor="#94A3B8"
              className="min-h-[52px] rounded-[18px] bg-white border border-slate-200 text-slate-900 text-[15px] px-4 py-3.5 mb-[18px]"
            />

            <Text className="text-slate-900 text-[15px] font-extrabold mb-2.5">
              Danh mục
            </Text>
            {isLoadingCategories ? (
              <View className="h-[52px] rounded-[18px] bg-white border border-slate-200 flex-row items-center px-4 mb-[18px]">
                <ActivityIndicator color="#4F46E5" />
                <Text className="text-slate-500 text-sm font-bold ml-2.5">
                  Đang tải danh mục...
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-[18px]"
              >
                <View className="flex-row pr-5">
                  <Pressable
                    onPress={() => setSelectedCategoryId(undefined)}
                    className={`min-h-10 rounded-full border px-[15px] items-center justify-center mr-2 ${
                      selectedCategoryId === undefined
                        ? "bg-primary border-primary"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-extrabold ${selectedCategoryId === undefined ? "text-white" : "text-slate-500"}`}
                    >
                      Không chọn
                    </Text>
                  </Pressable>
                  {categories.map((category) => {
                    const active =
                      String(selectedCategoryId) === String(category.id);
                    return (
                      <Pressable
                        key={String(category.id)}
                        onPress={() => setSelectedCategoryId(category.id)}
                        className={`min-h-10 rounded-full border px-[15px] items-center justify-center mr-2 ${
                          active
                            ? "bg-primary border-primary"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <Text
                          className={`text-[13px] font-extrabold ${active ? "text-white" : "text-slate-500"}`}
                        >
                          {category.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            <Text className="text-slate-900 text-[15px] font-extrabold mb-2.5">
              Trạng thái hiển thị
            </Text>
            <View className="flex-row gap-2.5 mb-6">
              {(["private", "public"] as const).map((option) => {
                const active = visibility === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setVisibility(option)}
                    className={`flex-1 h-[50px] rounded-[18px] border flex-row items-center justify-center ${
                      active
                        ? "bg-primary border-primary"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <Ionicons
                      name={option === "private" ? "lock-closed" : "earth"}
                      size={17}
                      color={active ? "#FFFFFF" : "#64748B"}
                    />
                    <Text
                      className={`text-sm font-extrabold ml-2 ${active ? "text-white" : "text-slate-500"}`}
                    >
                      {option === "private" ? "Private" : "Public"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-slate-900 text-xl font-extrabold">
                  Thẻ
                </Text>
                <Text className="text-slate-500 text-[13px] mt-1">
                  {cards.length} thẻ
                </Text>
              </View>
              <Pressable
                onPress={() =>
                  setCards((currentCards) => [
                    ...currentCards,
                    createCardDraft(),
                  ])
                }
                className="h-10 px-4 rounded-full bg-primary flex-row items-center justify-center"
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text className="text-white text-[13px] font-extrabold ml-1.5">
                  Thêm
                </Text>
              </Pressable>
            </View>

            {cards.map((card, index) => (
              <View
                key={card.id}
                className="rounded-3xl bg-white border border-slate-200 p-4 mb-3.5"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-slate-900 text-[15px] font-extrabold">
                    Thẻ {index + 1}
                  </Text>
                  <Pressable
                    onPress={() => handleDeleteCard(card)}
                    className="w-[34px] h-[34px] rounded-full bg-red-50 items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </Pressable>
                </View>

                <Text className="text-slate-600 text-[13px] font-extrabold mb-2">
                  Term
                </Text>
                <TextInput
                  value={card.term}
                  onChangeText={(value) =>
                    updateDraftCard(card.id, "term", value)
                  }
                  placeholder="Mặt trước"
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  className="min-h-20 rounded-[18px] bg-white border border-slate-200 text-slate-900 text-[15px] px-4 py-3.5 mb-3"
                />
                <Text className="text-slate-600 text-[13px] font-extrabold mb-2">
                  Definition
                </Text>
                <TextInput
                  value={card.definition}
                  onChangeText={(value) =>
                    updateDraftCard(card.id, "definition", value)
                  }
                  placeholder="Mặt sau"
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  className="min-h-20 rounded-[18px] bg-white border border-slate-200 text-slate-900 text-[15px] px-4 py-3.5 mb-3"
                />
                <Text className="text-slate-600 text-[13px] font-extrabold mb-2">
                  Explanation
                </Text>
                <TextInput
                  value={card.explanation}
                  onChangeText={(value) =>
                    updateDraftCard(card.id, "explanation", value)
                  }
                  placeholder="Không bắt buộc"
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  className="min-h-16 rounded-[18px] bg-white border border-slate-200 text-slate-900 text-[15px] px-4 py-3.5"
                />
              </View>
            ))}
          </View>
        </ScrollView>

        <View className="absolute left-0 right-0 bottom-0 bg-slate-50/95 border-t border-slate-200 px-5 pt-3.5 pb-[18px]">
          <Pressable
            disabled={isSaving || isStatusUpdating}
            onPress={handleSave}
            className="h-[54px] rounded-[18px] bg-primary flex-row items-center justify-center disabled:opacity-70"
          >
            {isSaving || isStatusUpdating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons name="save-outline" size={19} color="#FFFFFF" />
            )}
            <Text className="text-white text-base font-extrabold ml-2">
              Lưu thay đổi
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
