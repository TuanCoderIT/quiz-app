import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet } from "react-native";

import { AppBackground } from "../../src/components/common/AppBackground";
import { LoadingOverlay } from "../../src/features/ai/components/LoadingOverlay";
import { useAIFlashcardForm } from "../../src/features/flashcard/hooks/useAIFlashcardForm";
import { AIFlashcardCreateScreen } from "../../src/features/flashcard/screens/AIFlashcardCreateScreen";
import { useFlashcardStore } from "../../src/features/flashcard/store";

export default function AIFlashcardCreateRoute() {
  const router = useRouter();
  const fetchDecks = useFlashcardStore((state) => state.fetchDecks);
  const {
    form,
    errors,
    categories,
    isCategoriesLoading,
    isGenerating,
    updateField,
    pickDocument,
    removeFile,
    submit,
  } = useAIFlashcardForm();

  const handleSubmit = async () => {
    const response = await submit();

    if (!response) {
      return;
    }

    Alert.alert(
      "Tạo flashcard thành công",
      response.message || "Bộ thẻ AI đã được tạo.",
    );
    void fetchDecks();

    if (response.data?.id) {
      router.replace(`/flashcard/${response.data.id}`);
      return;
    }

    router.replace("/(tabs)/flashcard");
  };

  return (
    <AppBackground style={styles.background}>
      <AIFlashcardCreateScreen
        form={form}
        errors={errors}
        categories={categories}
        isCategoriesLoading={isCategoriesLoading}
        isGenerating={isGenerating}
        updateField={updateField}
        pickDocument={pickDocument}
        removeFile={removeFile}
        onSubmit={handleSubmit}
        onBack={() => router.back()}
      />

      <LoadingOverlay
        visible={isGenerating}
        title="Đang tạo Flashcard bằng AI"
        subtitle="Quá trình này thường mất khoảng 15-30 giây. Vui lòng không đóng ứng dụng hoặc quay lại."
        messages={[
          "AI is generating flashcards...",
          "Đang đọc nội dung học liệu...",
          "Đang trích xuất thuật ngữ và định nghĩa quan trọng...",
          "Đang viết giải thích ngắn gọn cho từng thẻ...",
          "Sắp hoàn tất! Đang lưu bộ flashcard...",
        ]}
      />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
