import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { QuizQuestion } from "../types";

const OPTION_KEYS = ["A", "B", "C", "D", "E", "F"];

type QuestionInputProps = {
  question: QuizQuestion;
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
};

type OptionQuestionProps = QuestionInputProps & {
  options: string[][];
};

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

const RadioOptionList = ({
  options,
  userAnswer,
  onAnswerChange,
}: Omit<OptionQuestionProps, "question">) => {
  return (
    <View>
      {options.map(([key, value]) => {
        const isSelected = userAnswer === key;

        return (
          <Pressable
            key={key}
            onPress={() => onAnswerChange(key)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            className={`mb-4 rounded-3xl border p-4 flex-row items-start ${
              isSelected
                ? "bg-primary/10 border-primary"
                : "bg-white border-gray-100"
            }`}
          >
            <View
              className={`w-9 h-9 rounded-2xl items-center justify-center mr-4 ${
                isSelected ? "bg-primary" : "bg-gray-100"
              }`}
            >
              <Text
                className={`font-bold ${
                  isSelected ? "text-white" : "text-text-secondary"
                }`}
              >
                {key}
              </Text>
            </View>
            <Text className="text-text-primary text-base leading-6 flex-1">
              {value}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export const MultipleChoiceQuestion = ({
  question,
  userAnswer,
  onAnswerChange,
}: QuestionInputProps) => {
  const options = getQuestionOptions(question);

  return (
    <View>
      <Text className="text-text-primary text-lg font-bold mb-4">
        Chọn đáp án
      </Text>
      <RadioOptionList
        options={options}
        userAnswer={userAnswer}
        onAnswerChange={onAnswerChange}
      />
    </View>
  );
};

export const TrueFalseQuestion = ({
  question,
  userAnswer,
  onAnswerChange,
}: QuestionInputProps) => {
  const options = getQuestionOptions(question);
  const normalizedOptions =
    options.length > 0
      ? options
      : [
          ["A", "True"],
          ["B", "False"],
        ];

  return (
    <View>
      <Text className="text-text-primary text-lg font-bold mb-4">
        Chọn đúng hoặc sai
      </Text>
      <RadioOptionList
        options={normalizedOptions}
        userAnswer={userAnswer}
        onAnswerChange={onAnswerChange}
      />
    </View>
  );
};

export const ShortAnswerQuestion = ({
  userAnswer,
  onAnswerChange,
}: QuestionInputProps) => {
  return (
    <View>
      <Text className="text-text-primary text-lg font-bold mb-4">
        Nhập câu trả lời ngắn
      </Text>
      <TextInput
        value={userAnswer}
        onChangeText={onAnswerChange}
        placeholder="Câu trả lời của bạn"
        placeholderTextColor="#94A3B8"
        returnKeyType="done"
        className="bg-white border border-gray-100 rounded-3xl px-5 py-4 text-text-primary text-base"
      />
    </View>
  );
};

export const EssayQuestion = ({
  userAnswer,
  onAnswerChange,
}: QuestionInputProps) => {
  return (
    <View>
      <Text className="text-text-primary text-lg font-bold mb-4">
        Viết bài tự luận
      </Text>
      <TextInput
        value={userAnswer}
        onChangeText={onAnswerChange}
        placeholder="Viết câu trả lời chi tiết..."
        placeholderTextColor="#94A3B8"
        multiline
        textAlignVertical="top"
        style={{ minHeight: 150 }}
        className="bg-white border border-gray-100 rounded-3xl px-5 py-4 text-text-primary text-base leading-6"
      />
      <Text className="text-text-secondary text-sm mt-3 leading-5">
        Câu tự luận sẽ được lưu để giáo viên chấm và phản hồi sau.
      </Text>
    </View>
  );
};

export const QuestionItem = ({
  question,
  userAnswer,
  onAnswerChange,
}: QuestionInputProps) => {
  switch (question.type) {
    case "true_false":
      return (
        <TrueFalseQuestion
          question={question}
          userAnswer={userAnswer}
          onAnswerChange={onAnswerChange}
        />
      );
    case "short_answer":
      return (
        <ShortAnswerQuestion
          question={question}
          userAnswer={userAnswer}
          onAnswerChange={onAnswerChange}
        />
      );
    case "essay":
      return (
        <EssayQuestion
          question={question}
          userAnswer={userAnswer}
          onAnswerChange={onAnswerChange}
        />
      );
    case "multiple_choice":
    default:
      return (
        <MultipleChoiceQuestion
          question={question}
          userAnswer={userAnswer}
          onAnswerChange={onAnswerChange}
        />
      );
  }
};
