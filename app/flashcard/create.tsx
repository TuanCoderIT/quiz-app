import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
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
import { createManualFlashcardSet } from "../../src/features/flashcard/api";
import { useFlashcardStore } from "../../src/features/flashcard/store";
import { FlashcardSetVisibility } from "../../src/features/flashcard/types";
import { getCategories } from "../../src/features/quiz/api";
import { Category } from "../../src/types/category";

type DraftCard = {
  id: string;
  frontText: string;
  backText: string;
};

const createDraftCard = (): DraftCard => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  frontText: "",
  backText: "",
});

const trimOrNull = (value: string) => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "";
};

const toCategoryId = (value: number | string | undefined): number | null => {
  if (value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export default function CreateFlashcardScreen() {
  const router = useRouter();
  const fetchDecks = useFlashcardStore((state) => state.fetchDecks);

  const [title, setTitle] = useState("");
  const [visibility, setVisibility] =
    useState<FlashcardSetVisibility>("private");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | string | undefined
  >();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<DraftCard[]>([createDraftCard()]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      setIsLoadingCategories(true);

      try {
        const categoryList = await getCategories();
        const usableCategories = categoryList.filter(
          (category) => String(category.id) !== "all",
        );

        if (!mounted) {
          return;
        }

        setCategories(usableCategories);
      } catch (error) {
        console.error("Lỗi tải danh mục flashcard:", error);
        Alert.alert("Không tải được danh mục", "Vui lòng thử lại sau.");
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

  const validCards = useMemo(
    () =>
      cards.map((card) => ({
        term: trimOrNull(card.frontText),
        definition: trimOrNull(card.backText),
        explanation: null,
      })),
    [cards],
  );

  const updateCard = (
    id: string,
    field: "frontText" | "backText",
    value: string,
  ) => {
    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === id ? { ...card, [field]: value } : card,
      ),
    );
  };

  const addCard = () => {
    setCards((currentCards) => [...currentCards, createDraftCard()]);
  };

  const removeCard = (id: string) => {
    setCards((currentCards) => {
      if (currentCards.length === 1) {
        return currentCards;
      }

      return currentCards.filter((card) => card.id !== id);
    });
  };

  const handleSubmit = async () => {
    const normalizedTitle = title.trim();
    const hasInvalidCard = validCards.some(
      (card) => !card.term || !card.definition,
    );

    if (!normalizedTitle) {
      Alert.alert("Thiếu tên bộ thẻ", "Vui lòng nhập tên bộ thẻ.");
      return;
    }

    if (hasInvalidCard) {
      Alert.alert("Thiếu nội dung thẻ", "Mỗi thẻ cần có mặt trước và mặt sau.");
      return;
    }

    setIsSubmitting(true);

    try {
      const deck = await createManualFlashcardSet(
        {
          title: normalizedTitle,
          category_id: toCategoryId(selectedCategoryId),
          visibility,
          source_type: "manual",
        },
        validCards,
      );

      void fetchDecks();
      router.replace(`/flashcard/${deck.id}`);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response?.status);
        console.log(JSON.stringify(error.response?.data, null, 2));
      }

      console.error("Lỗi tạo bộ flashcard:", error);
      Alert.alert(
        "Không tạo được bộ thẻ",
        "Vui lòng kiểm tra dữ liệu và thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="h-16 px-5 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            className="w-11 h-11 rounded-2xl bg-white border border-slate-200 items-center justify-center active:opacity-80"
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </Pressable>
          <Text className="text-slate-900 text-lg font-extrabold">
            Tạo bộ thẻ
          </Text>
          <View className="w-11" />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-5 pb-32">
            <View className="mb-[18px]">
              <Text className="text-slate-900 text-[15px] font-extrabold mb-2.5">
                Tên bộ thẻ
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ví dụ: Từ vựng React Native"
                placeholderTextColor="#94A3B8"
                className="min-h-[52px] rounded-[18px] bg-white border border-slate-200 text-slate-900 text-[15px] px-4 py-3.5"
              />
            </View>

            <View className="mb-[18px]">
              <Text className="text-slate-900 text-[15px] font-extrabold mb-2.5">
                Danh mục
              </Text>
              {isLoadingCategories ? (
                <View className="h-[52px] rounded-[18px] bg-white border border-slate-200 flex-row items-center px-4">
                  <ActivityIndicator color="#4F46E5" />
                  <Text className="text-slate-500 text-sm font-bold ml-2.5">
                    Đang tải danh mục...
                  </Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row pr-5">
                    <Pressable
                      onPress={() => setSelectedCategoryId(undefined)}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: selectedCategoryId === undefined,
                      }}
                      className={`min-h-10 rounded-full border px-[15px] items-center justify-center mr-2 active:opacity-80 ${
                        selectedCategoryId === undefined
                          ? "bg-primary border-primary"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <Text
                        className={`text-[13px] font-extrabold ${
                          selectedCategoryId === undefined
                            ? "text-white"
                            : "text-slate-500"
                        }`}
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
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          className={`min-h-10 rounded-full border px-[15px] items-center justify-center mr-2 active:opacity-80 ${
                            active
                              ? "bg-primary border-primary"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <Text
                            className={`text-[13px] font-extrabold ${
                              active ? "text-white" : "text-slate-500"
                            }`}
                          >
                            {category.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>

            <View className="mb-[18px]">
              <Text className="text-slate-900 text-[15px] font-extrabold mb-2.5">
                Trạng thái hiển thị
              </Text>
              <View className="flex-row gap-2.5">
                {(["private", "public"] as const).map((option) => {
                  const active = visibility === option;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => setVisibility(option)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      className={`flex-1 h-[50px] rounded-[18px] border flex-row items-center justify-center active:opacity-80 ${
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
                        className={`text-sm font-extrabold ml-[7px] ${
                          active ? "text-white" : "text-slate-500"
                        }`}
                      >
                        {option === "private" ? "Private" : "Public"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-2 mb-3.5">
              <View>
                <Text className="text-slate-900 text-[19px] font-extrabold">
                  Danh sách thẻ
                </Text>
                <Text className="text-slate-500 text-[13px] mt-1">
                  {cards.length} thẻ sẽ được tạo
                </Text>
              </View>
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
                    disabled={cards.length === 1}
                    onPress={() => removeCard(card.id)}
                    accessibilityRole="button"
                    className={`w-[34px] h-[34px] rounded-full items-center justify-center active:opacity-80 ${
                      cards.length === 1 ? "bg-slate-50" : "bg-red-50"
                    }`}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={cards.length === 1 ? "#CBD5E1" : "#EF4444"}
                    />
                  </Pressable>
                </View>

                <Text className="text-slate-600 text-[13px] font-extrabold mb-2 mt-1.5">
                  Mặt trước
                </Text>
                <TextInput
                  value={card.frontText}
                  onChangeText={(value) =>
                    updateCard(card.id, "frontText", value)
                  }
                  placeholder="Nhập câu hỏi, thuật ngữ hoặc gợi ý"
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  className="min-h-24 rounded-[18px] bg-white border border-slate-200 text-slate-900 text-[15px] leading-5 px-4 py-3.5"
                />

                <Text className="text-slate-600 text-[13px] font-extrabold mb-2 mt-1.5">
                  Mặt sau
                </Text>
                <TextInput
                  value={card.backText}
                  onChangeText={(value) =>
                    updateCard(card.id, "backText", value)
                  }
                  placeholder="Nhập đáp án hoặc định nghĩa"
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  className="min-h-24 rounded-[18px] bg-white border border-slate-200 text-slate-900 text-[15px] leading-5 px-4 py-3.5"
                />
              </View>
            ))}

            <Pressable
              onPress={addCard}
              accessibilityRole="button"
              className="h-12 rounded-[18px] flex-row items-center justify-center mb-3.5 active:opacity-80"
            >
              <Ionicons name="add" size={19} color="#000000" />
              <Text className="text-black text-sm font-extrabold ml-2">
                Thêm thẻ khác
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <View className="absolute left-0 right-0 bottom-0 bg-slate-50/95 border-t border-slate-200 px-5 pt-3.5 pb-[18px]">
          <Pressable
            disabled={isSubmitting}
            onPress={handleSubmit}
            accessibilityRole="button"
            className="h-[54px] rounded-[18px] bg-primary flex-row items-center justify-center active:opacity-80 disabled:opacity-70"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons name="save-outline" size={19} color="#FFFFFF" />
            )}
            <Text className="text-white text-base font-extrabold ml-2">
              {isSubmitting ? "Đang tạo bộ thẻ..." : "Tạo bộ thẻ"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
