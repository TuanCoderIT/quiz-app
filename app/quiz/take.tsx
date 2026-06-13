import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useAuthStore } from "../../src/features/auth/store";
import { generateWrongAnswerFlashcards } from "../../src/features/flashcard/api";
import { XpToast } from "../../src/features/gamification/components/XpToast";
import { getQuizById, submitQuizResult } from "../../src/features/quiz/api";
import { QuestionItem } from "../../src/features/quiz/components/QuestionItem";
import {
  QuizResultQuestionStatus,
  QuizResultScreen,
  QuizResultSummary,
} from "../../src/features/quiz/components/QuizResultScreen";
import { QuizDetail, QuizQuestion } from "../../src/features/quiz/types";

type QuizAnswers = Record<number, string>;

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

const isAnswerFilled = (answer?: string) =>
  String(answer ?? "").trim().length > 0;

const extractResultId = (payload: unknown): number | string | undefined => {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  if ("id" in payload) {
    const id = payload.id;
    return typeof id === "number" || typeof id === "string" ? id : undefined;
  }

  if ("result" in payload) {
    return extractResultId(payload.result);
  }

  if ("data" in payload) {
    return extractResultId(payload.data);
  }

  return undefined;
};

const normalizeTextAnswer = (value: QuizQuestion["answer"] | string) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const getQuestionType = (question: QuizQuestion) =>
  question.type || "multiple_choice";

const OPTION_KEYS = ["A", "B", "C", "D", "E", "F"];

const getQuestionOptions = (question: QuizQuestion) => {
  if (Array.isArray(question.options)) {
    return question.options
      .filter((value) => String(value ?? "").trim().length > 0)
      .map((value, index) => [
        OPTION_KEYS[index] || String(index + 1),
        String(value),
      ]);
  }

  if (question.options && Object.keys(question.options).length > 0) {
    return Object.entries(question.options).map(([key, value]) => [
      String(key),
      String(value),
    ]);
  }

  return [];
};

const getQuestionSubmissionOptions = (question: QuizQuestion) => {
  const options = getQuestionOptions(question);

  if (options.length > 0) {
    return options;
  }

  if (getQuestionType(question) === "true_false") {
    return [
      ["A", "True"],
      ["B", "False"],
    ];
  }

  return [];
};

const getSubmissionAnswer = (
  question: QuizQuestion,
  selectedAnswer?: string,
): string | null => {
  if (!isAnswerFilled(selectedAnswer)) {
    return null;
  }

  const rawAnswer = String(selectedAnswer);
  const options = getQuestionSubmissionOptions(question);

  if (options.length === 0) {
    return rawAnswer;
  }

  const selectedOption = options.find(
    ([key, value]) => key === rawAnswer || value === rawAnswer,
  );

  if (!selectedOption) {
    return rawAnswer;
  }

  const expectedAnswer = String(question.answer ?? "");
  const answerUsesOptionValue = options.some(
    ([, value]) => value === expectedAnswer,
  );
  const answerUsesOptionKey = options.some(([key]) => key === expectedAnswer);
  const [selectedKey, selectedValue] = selectedOption;

  if (answerUsesOptionValue) {
    return selectedValue;
  }

  if (answerUsesOptionKey) {
    return selectedKey;
  }

  return selectedKey;
};

const formatAnswerDisplay = (
  question: QuizQuestion,
  answer: QuizQuestion["answer"] | string | undefined,
  fallback = "Chưa trả lời",
) => {
  const rawAnswer = String(answer ?? "").trim();

  if (!rawAnswer) {
    return fallback;
  }

  const matchedOption = getQuestionOptions(question).find(
    ([key, value]) =>
      normalizeTextAnswer(key) === normalizeTextAnswer(rawAnswer) ||
      normalizeTextAnswer(value) === normalizeTextAnswer(rawAnswer),
  );

  if (matchedOption) {
    const [key, value] = matchedOption;
    return `${key}. ${value}`;
  }

  return rawAnswer;
};

const getQuestionResultStatus = (
  question: QuizQuestion,
  selectedAnswer?: string,
): QuizResultQuestionStatus => {
  const questionType = getQuestionType(question);

  if (questionType === "essay") {
    return "review";
  }

  if (!isAnswerFilled(selectedAnswer)) {
    return "incorrect";
  }

  return getSubmissionAnswer(question, selectedAnswer) ===
    String(question.answer ?? "")
    ? "correct"
    : "incorrect";
};

const QuizTakingScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const quizId = Number(Array.isArray(id) ? id[0] : id);

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [xpToast, setXpToast] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resultSummary, setResultSummary] = useState<QuizResultSummary | null>(
    null,
  );
  const hasFinishedRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  const questions = useMemo(() => sortQuestions(quiz?.questions || []), [quiz]);
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;
  const answeredCount = questions.filter((question) =>
    isAnswerFilled(answers[question.id]),
  ).length;
  const progress =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const hasEssayQuestion = questions.some(
    (question) => getQuestionType(question) === "essay",
  );

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

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const showXpToast = useCallback((label: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setXpToast(label);
    toastTimerRef.current = setTimeout(() => setXpToast(null), 1800);
  }, []);

  const calculateResult = useCallback(
    (remainingSeconds: number, timedOut: boolean): QuizResultSummary | null => {
      if (!quiz || totalQuestions === 0) {
        return null;
      }

      const score = questions.reduce((total, question) => {
        const selected = answers[question.id];
        const questionType = getQuestionType(question);

        if (!isAnswerFilled(selected) || questionType === "essay") {
          return total;
        }

        return getSubmissionAnswer(question, selected) ===
          String(question.answer ?? "")
          ? total + 1
          : total;
      }, 0);

      const autoGradableTotal = questions.filter(
        (question) => getQuestionType(question) !== "essay",
      ).length;
      const percentage =
        autoGradableTotal > 0
          ? Math.round((score / autoGradableTotal) * 100)
          : 0;
      const timeSpent = Math.max(
        0,
        getDurationSeconds(quiz) - remainingSeconds,
      );
      const resultQuestions = questions.map((question, index) => {
        const selected = answers[question.id];

        return {
          questionId: question.id,
          order: index + 1,
          content: question.content,
          userAnswer: formatAnswerDisplay(question, selected),
          correctAnswer: formatAnswerDisplay(
            question,
            question.answer,
            "Chưa có đáp án",
          ),
          explanation: question.explanation,
          status: getQuestionResultStatus(question, selected),
        };
      });

      return {
        score,
        total: autoGradableTotal,
        percentage,
        timeSpent,
        timedOut,
        needsReview: hasEssayQuestion,
        questions: resultQuestions,
      };
    },
    [answers, hasEssayQuestion, questions, quiz, totalQuestions],
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
        const savedResult = await submitQuizResult({
          exam_id: quiz.id,
          time_spent: summary.timeSpent,
          answers: questions.map((question) => ({
            question_id: question.id,
            user_answer: getSubmissionAnswer(question, answers[question.id]),
          })),
        });
        console.log("learning action response:", savedResult);
        const resultId = extractResultId(savedResult);

        if (resultId) {
          setResultSummary((current) =>
            current ? { ...current, id: resultId } : current,
          );
        }

        await refreshUser().catch((refreshError) => {
          console.error("Lỗi refresh user sau khi nộp quiz:", refreshError);
        });
        showXpToast("+50 XP");
      } catch (saveError) {
        console.error("Lỗi lưu kết quả quiz:", saveError);
        setSubmitError(
          "Kết quả đã tính xong nhưng chưa lưu được lên hệ thống.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      answers,
      calculateResult,
      questions,
      quiz,
      refreshUser,
      showXpToast,
      timeLeft,
    ],
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
          {
            text: "Nộp bài",
            style: "destructive",
            onPress: () => finishQuiz(false),
          },
        ],
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
    setIsGeneratingFlashcards(false);
    setResultSummary(null);
    setTimeLeft(getDurationSeconds(quiz));
  };

  const handleGenerateWrongAnswerFlashcards = async () => {
    if (!resultSummary?.id || isGeneratingFlashcards) {
      return;
    }

    setIsGeneratingFlashcards(true);

    try {
      const generated = await generateWrongAnswerFlashcards(resultSummary.id);
      await refreshUser().catch((refreshError) => {
        console.error("Lỗi refresh user sau khi tạo flashcards:", refreshError);
      });
      console.log("Kết quả khi tạo thẻ bằng AI", generated);
      showXpToast("+15 XP");
      await new Promise((resolve) => setTimeout(resolve, 650));
      router.push(`/flashcard/${generated.flashcardSet.id}`);
    } catch (generateError) {
      if (isAxiosError(generateError)) {
        const status = generateError.response?.status;

        if (status === 422) {
          Alert.alert("Thông báo", "Không có câu sai để tạo flashcards.");
          return;
        }

        if (status === 403) {
          Alert.alert(
            "Không thể tạo flashcards",
            "Bạn không có quyền truy cập result này.",
          );
          return;
        }
      }

      console.error("Lỗi tạo flashcards từ câu sai:", generateError);
      Alert.alert("Không thể tạo flashcards", "Vui lòng thử lại sau.");
    } finally {
      setIsGeneratingFlashcards(false);
    }
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
    return (
      <View className="flex-1">
        <QuizResultScreen
          passingScore={quiz.passing_score || 70}
          resultSummary={resultSummary}
          isSubmitting={isSubmitting}
          submitError={submitError}
          isGeneratingFlashcards={isGeneratingFlashcards}
          onBack={() => router.back()}
          onRestart={handleRestart}
          onPracticePress={() => router.replace("/(tabs)/practice")}
          onGenerateWrongAnswerFlashcards={
            resultSummary.id ? handleGenerateWrongAnswerFlashcards : undefined
          }
        />
        <XpToast label={xpToast} />
      </View>
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
                <Text
                  className="text-text-primary text-base font-bold"
                  numberOfLines={1}
                >
                  {quiz.title}
                </Text>
                <Text
                  className="text-text-secondary text-xs mt-1"
                  numberOfLines={1}
                >
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
              <View
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 120,
            }}
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
