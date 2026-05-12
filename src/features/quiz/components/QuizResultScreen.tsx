import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type QuizResultQuestionStatus = "correct" | "incorrect" | "review";

export type QuizResultQuestion = {
  questionId: number;
  order: number;
  content: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  status: QuizResultQuestionStatus;
};

export type QuizResultSummary = {
  score: number;
  total: number;
  percentage: number;
  timeSpent: number;
  timedOut: boolean;
  needsReview: boolean;
  questions: QuizResultQuestion[];
};

type QuizResultScreenProps = {
  passingScore?: number;
  resultSummary: QuizResultSummary;
  isSubmitting: boolean;
  submitError?: string | null;
  onBack: () => void;
  onRestart: () => void;
  onPracticePress: () => void;
};

const formatTimer = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const statusConfig = {
  correct: {
    icon: "checkmark-circle" as const,
    iconColor: "#10B981",
    label: "Đúng",
    badgeClassName: "bg-success/10",
    textClassName: "text-success",
  },
  incorrect: {
    icon: "close-circle" as const,
    iconColor: "#EF4444",
    label: "Sai",
    badgeClassName: "bg-error/10",
    textClassName: "text-error",
  },
  review: {
    icon: "document-text" as const,
    iconColor: "#F59E0B",
    label: "Chờ chấm",
    badgeClassName: "bg-accent/10",
    textClassName: "text-accent",
  },
};

export const QuizResultScreen = ({
  passingScore = 70,
  resultSummary,
  isSubmitting,
  submitError,
  onBack,
  onRestart,
  onPracticePress,
}: QuizResultScreenProps) => {
  const passed = resultSummary.percentage >= passingScore;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
      >
        <View className="mt-5 mb-8 flex-row items-center justify-between">
          <Pressable
            onPress={onBack}
            className="w-11 h-11 rounded-2xl bg-white border border-gray-100 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </Pressable>
          <Text className="text-text-primary text-lg font-bold">Kết quả</Text>
          <View className="w-11" />
        </View>

        <LinearGradient
          colors={passed ? ["#4F46E5", "#7C3AED"] : ["#64748B", "#334155"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 24, marginBottom: 20 }}
        >
          <Text className="text-white/75 text-sm font-bold uppercase mb-3">
            {resultSummary.timedOut ? "Hết thời gian" : "Hoàn thành"}
          </Text>
          <Text className="text-white text-5xl font-bold mb-2">
            {resultSummary.percentage}%
          </Text>
          <Text className="text-white/90 text-base leading-6">
            {resultSummary.total > 0
              ? `Bạn đúng ${resultSummary.score}/${resultSummary.total} câu tự chấm trong ${formatTimer(resultSummary.timeSpent)}.`
              : `Bài làm đã được ghi nhận trong ${formatTimer(resultSummary.timeSpent)}.`}
          </Text>
        </LinearGradient>

        {resultSummary.needsReview ? (
          <View className="bg-accent/10 rounded-2xl border border-accent/20 p-4 mb-5">
            <Text className="text-accent font-semibold leading-5">
              Bài có câu tự luận đang chờ giáo viên review.
            </Text>
          </View>
        ) : null}

        <View className="bg-white rounded-3xl border border-gray-100 p-5 mb-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary font-bold text-base">
              Trạng thái
            </Text>
            <Text className={`font-bold ${passed ? "text-success" : "text-warning"}`}>
              {passed ? "Đạt" : "Cần luyện thêm"}
            </Text>
          </View>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View
              className={passed ? "h-full bg-success" : "h-full bg-warning"}
              style={{ width: `${resultSummary.percentage}%` }}
            />
          </View>
          <Text className="text-text-secondary text-sm mt-3">
            Điểm đạt yêu cầu: {passingScore}%
          </Text>
        </View>

        <View className="mb-5">
          <Text className="text-text-primary text-xl font-bold mb-4">
            Chi tiết câu trả lời
          </Text>
          {resultSummary.questions.map((question) => {
            const config = statusConfig[question.status];

            return (
              <View
                key={question.questionId}
                className="bg-white rounded-3xl border border-gray-100 p-5 mb-4"
              >
                <View className="flex-row items-start justify-between mb-4">
                  <Text className="text-text-primary font-bold text-base flex-1 pr-3">
                    Câu {question.order}. {question.content}
                  </Text>
                  <View
                    className={`px-3 py-1.5 rounded-full flex-row items-center ${config.badgeClassName}`}
                  >
                    <Ionicons name={config.icon} size={15} color={config.iconColor} />
                    <Text className={`text-xs font-bold ml-1 ${config.textClassName}`}>
                      {config.label}
                    </Text>
                  </View>
                </View>

                <View className="bg-gray-50 rounded-2xl p-4 mb-3">
                  <Text className="text-text-secondary text-xs font-bold uppercase mb-1">
                    Câu trả lời của bạn
                  </Text>
                  <Text className="text-text-primary text-sm leading-5">
                    {question.userAnswer}
                  </Text>
                </View>

                {question.status !== "review" ? (
                  <View className="bg-success/5 rounded-2xl p-4 mb-3">
                    <Text className="text-success text-xs font-bold uppercase mb-1">
                      Đáp án đúng
                    </Text>
                    <Text className="text-text-primary text-sm leading-5">
                      {question.correctAnswer}
                    </Text>
                  </View>
                ) : null}

                {question.explanation ? (
                  <View className="bg-primary/5 rounded-2xl p-4">
                    <Text className="text-primary text-xs font-bold uppercase mb-1">
                      Giải thích
                    </Text>
                    <Text className="text-text-primary text-sm leading-5">
                      {question.explanation}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        {isSubmitting ? (
          <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 flex-row items-center">
            <ActivityIndicator color="#4F46E5" />
            <Text className="text-text-secondary font-medium ml-3">
              Đang lưu kết quả...
            </Text>
          </View>
        ) : null}

        {submitError ? (
          <View className="bg-warning/10 rounded-2xl border border-warning/20 p-4 mb-5">
            <Text className="text-warning font-semibold">{submitError}</Text>
          </View>
        ) : null}

        <Pressable onPress={onRestart} className="bg-primary rounded-2xl py-4 mb-3">
          <Text className="text-white text-center text-base font-bold">
            Làm lại quiz
          </Text>
        </Pressable>
        <Pressable
          onPress={onPracticePress}
          className="bg-primary/10 rounded-2xl py-4"
        >
          <Text className="text-primary text-center text-base font-bold">
            Về danh sách luyện tập
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};
