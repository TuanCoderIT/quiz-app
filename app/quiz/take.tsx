import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { QuestionItem } from "../../src/features/quiz/components/QuestionItem";
import { getQuizById, submitQuizResult } from "../../src/features/quiz/api";
import {
  QuizAnswerSubmission,
  QuizDetail,
  QuizQuestion,
} from "../../src/features/quiz/types";

type QuizAnswers = Record<number, string>;

type ResultSummary = {
  score: number;
  total: number;
  percentage: number;
  timeSpent: number;
  timedOut: boolean;
  needsReview: boolean;
};

const formatTimer = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const getDurationSeconds = (quiz: QuizDetail | null) => {
  const durationMinutes = Number(quiz?.duration || 0);
  return Math.max(1, durationMinutes) * 60;
};

const getCategoryLabel = (quiz: QuizDetail) => {
  if (typeof quiz.category === "string") {
    return quiz.category;
  }

  return quiz.category?.name || "Quiz";
};

const sortQuestions = (questions: QuizQuestion[]) => {
  return [...questions].sort((a, b) => {
    const orderA = a.pivot?.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.pivot?.order ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
};

const isAnswerFilled = (answer?: string) => String(answer ?? "").trim().length > 0;

const normalizeTextAnswer = (value: QuizQuestion["answer"] | string) =>
  String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();

const isShortAnswerCorrect = (userAnswer: string, correctAnswer: QuizQuestion["answer"]) => {
  const normalizedUserAnswer = normalizeTextAnswer(userAnswer);
  const normalizedCorrectAnswer = normalizeTextAnswer(correctAnswer);

  if (!normalizedUserAnswer || !normalizedCorrectAnswer) {
    return false;
  }

  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    return true;
  }

  const maxLength = Math.max(normalizedUserAnswer.length, normalizedCorrectAnswer.length);
  const allowedDifference = Math.max(1, Math.floor(maxLength * 0.1));

  return getEditDistance(normalizedUserAnswer, normalizedCorrectAnswer) <= allowedDifference;
};

const getEditDistance = (a: string, b: string) => {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + substitutionCost
      );
    }
  }

  return matrix[a.length][b.length];
};

const getQuestionType = (question: QuizQuestion) => question.type || "multiple_choice";

const buildAnswerSubmissions = (
  questions: QuizQuestion[],
  answers: QuizAnswers
): QuizAnswerSubmission[] => {
  return questions.map((question) => ({
    question_id: question.id,
    type: getQuestionType(question),
    answer: String(answers[question.id] ?? "").trim(),
  }));
};

const QuizTakingScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const quizId = Number(Array.isArray(id) ? id[0] : id);

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resultSummary, setResultSummary] = useState<ResultSummary | null>(null);
  const hasFinishedRef = useRef(false);

  const questions = useMemo(() => sortQuestions(quiz?.questions || []), [quiz]);
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const answeredCount = questions.filter((question) =>
    isAnswerFilled(answers[question.id])
  ).length;
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const hasEssayQuestion = questions.some((question) => getQuestionType(question) === "essay");

  const loadQuiz = useCallback(async () => {
    if (!Number.isFinite(quizId) || quizId <= 0) {
      setError("Không tìm thấy mã quiz hợp lệ.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const quizDetail = await getQuizById(quizId);
      const normalizedQuiz = {
        ...quizDetail,
        questions: sortQuestions(quizDetail.questions || []),
      };

      if (normalizedQuiz.questions.length === 0) {
        setError("Quiz này chưa có câu hỏi để làm bài.");
        setQuiz(normalizedQuiz);
        return;
      }

      setQuiz(normalizedQuiz);
      setTimeLeft(getDurationSeconds(normalizedQuiz));
    } catch (loadError) {
      console.error("Lỗi tải quiz:", loadError);
      setError("Không thể tải quiz. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const calculateResult = useCallback(
    (remainingSeconds: number, timedOut: boolean): ResultSummary | null => {
      if (!quiz || totalQuestions === 0) {
        return null;
      }

      const score = questions.reduce((total, question) => {
        const selected = answers[question.id];
        const questionType = getQuestionType(question);

        if (!isAnswerFilled(selected) || questionType === "essay") {
          return total;
        }

        if (questionType === "short_answer") {
          return isShortAnswerCorrect(selected, question.answer) ? total + 1 : total;
        }

        return normalizeTextAnswer(selected) === normalizeTextAnswer(question.answer)
          ? total + 1
          : total;
      }, 0);

      const autoGradableTotal = questions.filter(
        (question) => getQuestionType(question) !== "essay"
      ).length;
      const percentage =
        autoGradableTotal > 0 ? Math.round((score / autoGradableTotal) * 100) : 0;
      const timeSpent = Math.max(0, getDurationSeconds(quiz) - remainingSeconds);

      return {
        score,
        total: autoGradableTotal,
        percentage,
        timeSpent,
        timedOut,
        needsReview: hasEssayQuestion,
      };
    },
    [answers, hasEssayQuestion, questions, quiz, totalQuestions]
  );

  const finishQuiz = useCallback(
    async (timedOut = false) => {
      if (!quiz || hasFinishedRef.current) {
        return;
      }

      hasFinishedRef.current = true;
      const summary = calculateResult(timedOut ? 0 : timeLeft, timedOut);

      if (!summary) {
        return;
      }

      setResultSummary(summary);
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await submitQuizResult({
          exam_id: quiz.id,
          time_spent: summary.timeSpent,
          completed_at: new Date().toISOString(),
          answers: buildAnswerSubmissions(questions, answers),
        });
      } catch (saveError) {
        console.error("Lỗi lưu kết quả quiz:", saveError);
        setSubmitError("Kết quả đã tính xong nhưng chưa lưu được lên hệ thống.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers, calculateResult, questions, quiz, timeLeft]
  );

  useEffect(() => {
    if (!quiz || isLoading || resultSummary || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, quiz, resultSummary, timeLeft]);

  useEffect(() => {
    if (quiz && !resultSummary && timeLeft === 0 && !hasFinishedRef.current) {
      finishQuiz(true);
    }
  }, [finishQuiz, quiz, resultSummary, timeLeft]);

  const handleSelectAnswer = (answerKey: string) => {
    if (!currentQuestion) {
      return;
    }

    setAnswerError(null);
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: answerKey,
    }));
  };

  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) {
      return false;
    }

    return isAnswerFilled(answers[currentQuestion.id]);
  };

  const handleFinishPress = () => {
    if (!isCurrentQuestionAnswered()) {
      setAnswerError("Vui lòng trả lời câu hỏi này trước khi nộp bài.");
      return;
    }

    const unansweredCount = Math.max(0, totalQuestions - answeredCount);

    if (unansweredCount > 0) {
      Alert.alert(
        "Nộp bài?",
        `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn vẫn muốn nộp bài?`,
        [
          { text: "Tiếp tục làm", style: "cancel" },
          { text: "Nộp bài", style: "destructive", onPress: () => finishQuiz(false) },
        ]
      );
      return;
    }

    finishQuiz(false);
  };

  const handleNext = () => {
    if (!isCurrentQuestionAnswered()) {
      setAnswerError("Vui lòng trả lời câu hỏi này trước khi tiếp tục.");
      return;
    }

    if (currentIndex < totalQuestions - 1) {
      setAnswerError(null);
      setCurrentIndex((value) => value + 1);
      return;
    }

    handleFinishPress();
  };

  const handleRestart = () => {
    hasFinishedRef.current = false;
    setAnswers({});
    setCurrentIndex(0);
    setAnswerError(null);
    setSubmitError(null);
    setResultSummary(null);
    setTimeLeft(getDurationSeconds(quiz));
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-text-secondary mt-4 text-base font-medium">
          Đang tải quiz...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !quiz) {
    return (
      <SafeAreaView className="flex-1 bg-background px-5">
        <View className="flex-1 items-center justify-center">
          <View className="w-16 h-16 rounded-3xl bg-error/10 items-center justify-center mb-5">
            <Ionicons name="alert-circle-outline" size={30} color="#EF4444" />
          </View>
          <Text className="text-text-primary text-xl font-bold text-center mb-2">
            Không thể mở quiz
          </Text>
          <Text className="text-text-secondary text-base text-center leading-6 mb-8">
            {error || "Đã có lỗi xảy ra khi tải dữ liệu."}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="bg-primary px-6 py-4 rounded-2xl"
          >
            <Text className="text-white font-bold text-base">Quay lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (resultSummary) {
    const passed = resultSummary.percentage >= (quiz.passing_score || 70);

    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        >
          <View className="mt-5 mb-8 flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
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
              <Text
                className={`font-bold ${passed ? "text-success" : "text-warning"}`}
              >
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
              Điểm đạt yêu cầu: {quiz.passing_score || 70}%
            </Text>
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

          <Pressable onPress={handleRestart} className="bg-primary rounded-2xl py-4 mb-3">
            <Text className="text-white text-center text-base font-bold">
              Làm lại quiz
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/(tabs)/practice")}
            className="bg-primary/10 rounded-2xl py-4"
          >
            <Text className="text-primary text-center text-base font-bold">
              Về danh sách luyện tập
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        style={{ flex: 1 }}
      >
      <View className="flex-1">
        <View className="px-5 pt-4 pb-3">
          <View className="flex-row items-center justify-between mb-5">
            <Pressable
              onPress={() => router.back()}
              className="w-11 h-11 rounded-2xl bg-white border border-gray-100 items-center justify-center"
            >
              <Ionicons name="chevron-back" size={22} color="#0F172A" />
            </Pressable>

            <View className="items-center flex-1 px-4">
              <Text className="text-text-primary text-base font-bold" numberOfLines={1}>
                {quiz.title}
              </Text>
              <Text className="text-text-secondary text-xs mt-1" numberOfLines={1}>
                {getCategoryLabel(quiz)}
              </Text>
            </View>

            <View
              className={`px-3 h-11 rounded-2xl items-center justify-center ${
                timeLeft <= 60 ? "bg-error/10" : "bg-primary/10"
              }`}
            >
              <Text
                className={`font-bold ${
                  timeLeft <= 60 ? "text-error" : "text-primary"
                }`}
              >
                {formatTimer(timeLeft)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-secondary text-sm font-semibold">
              Câu {currentIndex + 1}/{totalQuestions}
            </Text>
            <Text className="text-text-secondary text-sm font-semibold">
              Đã trả lời {answeredCount}/{totalQuestions}
            </Text>
          </View>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 }}
        >
          <View className="bg-white/90 border border-white rounded-3xl p-6 shadow-sm mb-6">
            <Text className="text-text-secondary text-sm font-bold uppercase mb-3">
              Nội dung câu hỏi
            </Text>
            <Text className="text-text-primary text-2xl font-bold leading-8">
              {currentQuestion?.content}
            </Text>
          </View>

          {currentQuestion ? (
            <QuestionItem
              question={currentQuestion}
              userAnswer={selectedAnswer || ""}
              onAnswerChange={handleSelectAnswer}
            />
          ) : null}

          {answerError ? (
            <View className="bg-error/10 border border-error/20 rounded-2xl px-4 py-3 mt-1">
              <Text className="text-error text-sm font-semibold">
                {answerError}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View className="absolute left-0 right-0 bottom-0 px-5 pt-4 pb-5 bg-background/95 border-t border-gray-100">
          <View className="flex-row gap-3">
            <Pressable
              disabled={currentIndex === 0}
              onPress={() => {
                setAnswerError(null);
                setCurrentIndex((value) => Math.max(0, value - 1));
              }}
              className={`flex-1 py-4 rounded-2xl items-center ${
                currentIndex === 0 ? "bg-gray-100" : "bg-primary/10"
              }`}
            >
              <Text
                className={`font-bold text-base ${
                  currentIndex === 0 ? "text-text-disabled" : "text-primary"
                }`}
              >
                Previous
              </Text>
            </Pressable>

            <Pressable
              onPress={handleNext}
              style={{ flex: 1.35 }}
              className="rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={["#4F46E5", "#7C3AED"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  alignItems: "center",
                  borderRadius: 16,
                  justifyContent: "center",
                  paddingVertical: 16,
                }}
              >
                <Text className="text-white font-bold text-base">
                  {currentIndex === totalQuestions - 1 ? "Nộp bài" : "Next"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default QuizTakingScreen;
