import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { AppBackground } from "../../src/components/common/AppBackground";
import { useAIQuizForm } from "../../src/features/ai/hooks/useAIQuizForm";
import { ConfigureQuizScreen } from "../../src/features/ai/screens/ConfigureQuizScreen";
import { PreviewQuizScreen } from "../../src/features/ai/screens/PreviewQuizScreen";
import { LoadingOverlay } from "../../src/features/ai/components/LoadingOverlay";
import { AIQuizDetail } from "../../src/features/ai/ai.types";

export default function AIQuizRoute() {
  const router = useRouter();
  const [step, setStep] = useState<"configure" | "preview">("configure");
  const [generatedQuiz, setGeneratedQuiz] = useState<AIQuizDetail | null>(null);

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
  } = useAIQuizForm();

  // Submit handler
  const handleSubmit = async () => {
    try {
      const quiz = await submit();
      if (quiz) {
        setGeneratedQuiz(quiz);
        setStep("preview");
      }
    } catch (error) {
      console.error("AI quiz generation error:", error);
      Alert.alert(
        "Lỗi tạo bài học",
        "Đã có lỗi xảy ra trong quá trình tạo bài học bằng AI. Vui lòng kiểm tra và thử lại."
      );
    }
  };

  // Start Quiz Action
  const handleStartQuiz = () => {
    if (!generatedQuiz) return;
    router.replace({
      pathname: "/quiz/[id]/start",
      params: { id: String(generatedQuiz.id) },
    });
  };

  // Save Quiz Action
  const handleSaveQuiz = () => {
    if (!generatedQuiz) return;
    router.replace({
      pathname: "/quiz/[id]",
      params: { id: String(generatedQuiz.id) },
    });
  };

  // Back from Preview Action
  const handleBackFromPreview = () => {
    setStep("configure");
  };

  // Lookup Category Name
  const getCategoryName = () => {
    if (!generatedQuiz) return "Chủ đề";
    const matched = categories.find((c) => Number(c.id) === generatedQuiz.category_id);
    return matched ? matched.name : "Chủ đề";
  };

  return (
    <AppBackground style={styles.background}>
      {step === "configure" ? (
        <ConfigureQuizScreen
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
      ) : generatedQuiz ? (
        <PreviewQuizScreen
          quiz={generatedQuiz}
          categoryName={getCategoryName()}
          onStartQuiz={handleStartQuiz}
          onSaveQuiz={handleSaveQuiz}
          onBack={handleBackFromPreview}
        />
      ) : null}

      <LoadingOverlay visible={isGenerating} />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
