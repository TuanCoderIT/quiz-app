import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AIQuizDetail } from "../ai.types";

interface PreviewQuizScreenProps {
  quiz: AIQuizDetail;
  categoryName: string;
  onStartQuiz: () => void;
  onSaveQuiz: () => void;
  onBack: () => void;
}

export const PreviewQuizScreen: React.FC<PreviewQuizScreenProps> = ({
  quiz,
  categoryName,
  onStartQuiz,
  onSaveQuiz,
  onBack,
}) => {
  const getDifficultyColor = () => {
    switch (quiz.difficulty) {
      case "Beginner":
        return { text: "#10B981", bg: "rgba(16,185,129,0.08)" };
      case "Intermediate":
        return { text: "#F59E0B", bg: "rgba(245,158,11,0.08)" };
      case "Advanced":
        return { text: "#EF4444", bg: "rgba(239,68,68,0.08)" };
      default:
        return { text: "#64748B", bg: "#F1F5F9" };
    }
  };

  const diffColors = getDifficultyColor();

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Title */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xem trước Quiz</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: "rgba(79,70,229,0.08)" }]}>
              <Text style={[styles.badgeText, { color: "#4F46E5" }]}>
                {categoryName}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: diffColors.bg }]}>
              <Text style={[styles.badgeText, { color: diffColors.text }]}>
                {quiz.difficulty}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "rgba(6,182,212,0.08)" }]}>
              <Text style={[styles.badgeText, { color: "#0891B2" }]}>
                AI Generated
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{quiz.title}</Text>
          {quiz.description ? (
            <Text style={styles.heroDesc}>{quiz.description}</Text>
          ) : null}

          {/* Quick Stats Grid */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Số câu hỏi</Text>
              <Text style={styles.statVal}>{quiz.questions.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Thời gian</Text>
              <Text style={styles.statVal}>{quiz.duration}m</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Điểm đạt</Text>
              <Text style={styles.statVal}>{quiz.passing_score}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Lượt làm bài</Text>
              <Text style={styles.statVal}>
                {quiz.max_attempts === 0 ? "∞" : quiz.max_attempts}
              </Text>
            </View>
          </View>
        </View>

        {/* Questions Header */}
        <Text style={styles.sectionTitle}>Nội dung câu hỏi</Text>

        {/* Questions List */}
        {quiz.questions.map((question, qIndex) => {
          const options = Object.entries(question.options);

          return (
            <View key={question.id || qIndex} style={styles.qCard}>
              <View style={styles.qCardHeader}>
                <View style={styles.qIndexPill}>
                  <Text style={styles.qIndexText}>Câu {qIndex + 1}</Text>
                </View>
                <View style={styles.pointsPill}>
                  <Text style={styles.pointsText}>+{question.points || 1} đ</Text>
                </View>
              </View>

              <Text style={styles.qText}>{question.content}</Text>

              {/* Options */}
              <View style={styles.optionsList}>
                {options.map(([key, val]) => {
                  const isCorrect = key === question.answer;

                  return (
                    <View
                      key={key}
                      style={[
                        styles.optionItem,
                        isCorrect && styles.optionItemCorrect,
                      ]}
                    >
                      <View
                        style={[
                          styles.optionIndicator,
                          isCorrect && styles.optionIndicatorCorrect,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionIndicatorText,
                            isCorrect && styles.optionIndicatorTextCorrect,
                          ]}
                        >
                          {key}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.optionValueText,
                          isCorrect && styles.optionValueTextCorrect,
                        ]}
                      >
                        {val}
                      </Text>
                      {isCorrect ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#10B981"
                          style={styles.correctCheck}
                        />
                      ) : null}
                    </View>
                  );
                })}
              </View>

              {/* Explanation Callout */}
              {question.explanation ? (
                <View style={styles.explanationBox}>
                  <View style={styles.expHeader}>
                    <Ionicons
                      name="bulb-outline"
                      size={16}
                      color="#D97706"
                    />
                    <Text style={styles.expTitle}>Giải thích chi tiết</Text>
                  </View>
                  <Text style={styles.expText}>{question.explanation}</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      {/* Sticky Bottom Actions Container */}
      <View style={styles.bottomBar}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={onSaveQuiz}
            activeOpacity={0.7}
          >
            <Ionicons name="bookmark-outline" size={18} color="#4F46E5" />
            <Text style={styles.saveBtnText}>Lưu Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={onStartQuiz}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#4F46E5", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startGradient}
            >
              <Ionicons name="play-outline" size={18} color="#FFFFFF" />
              <Text style={styles.startBtnText}>Làm Bài Ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.65)",
    padding: 20,
    marginBottom: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 28,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(226,232,240,0.65)",
    paddingTop: 14,
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 4,
  },
  statVal: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
    marginLeft: 4,
  },
  qCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.65)",
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 1,
  },
  qCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  qIndexPill: {
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qIndexText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4F46E5",
  },
  pointsPill: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  qText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 22,
    marginBottom: 16,
  },
  optionsList: {
    gap: 8,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.85)",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionItemCorrect: {
    borderColor: "rgba(16,185,129,0.3)",
    backgroundColor: "#F0FDF4",
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "rgba(226,232,240,0.85)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  optionIndicatorCorrect: {
    backgroundColor: "#10B981",
  },
  optionIndicatorText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  optionIndicatorTextCorrect: {
    color: "#FFFFFF",
  },
  optionValueText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    lineHeight: 18,
  },
  optionValueTextCorrect: {
    color: "#065F46",
    fontWeight: "700",
  },
  correctCheck: {
    marginLeft: 6,
  },
  explanationBox: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FEF3C7",
    borderRadius: 14,
    padding: 12,
  },
  expHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  expTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D97706",
  },
  expText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(226,232,240,0.65)",
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  saveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveBtnText: {
    color: "#4F46E5",
    fontSize: 15,
    fontWeight: "700",
  },
  startBtn: {
    flex: 1.4,
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
  },
  startGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  startBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
