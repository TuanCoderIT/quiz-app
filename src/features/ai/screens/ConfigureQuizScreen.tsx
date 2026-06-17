import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Input } from "../../../components/common/Input";
import { ScreenContainer } from "../../../components/common/ScreenContainer";
import { Colors } from "../../../theme";
import { AIQuizFormErrors, AIQuizFormState, QuizDifficulty } from "../ai.types";
import { Category } from "../../../types/category";

interface ConfigureQuizScreenProps {
  form: AIQuizFormState;
  errors: AIQuizFormErrors;
  categories: Category[];
  isCategoriesLoading: boolean;
  isGenerating: boolean;
  updateField: <K extends keyof AIQuizFormState>(
    field: K,
    value: AIQuizFormState[K]
  ) => void;
  pickDocument: () => Promise<void>;
  removeFile: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

export const ConfigureQuizScreen: React.FC<ConfigureQuizScreenProps> = ({
  form,
  errors,
  categories,
  isCategoriesLoading,
  isGenerating,
  updateField,
  pickDocument,
  removeFile,
  onSubmit,
  onBack,
}) => {
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Get selected category name
  const getSelectedCategoryName = () => {
    if (form.category_id === null) return "Chọn danh mục...";
    const matched = categories.find((c) => Number(c.id) === form.category_id);
    return matched ? matched.name : "Chọn danh mục...";
  };

  const difficulties: QuizDifficulty[] = ["Beginner", "Intermediate", "Advanced"];
  const difficultyLabels: Record<QuizDifficulty, string> = {
    Beginner: "Cơ bản",
    Intermediate: "Trung bình",
    Advanced: "Nâng cao",
  };

  const questionPresets = [5, 10, 15, 20];

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI POWERED</Text>
          </View>
          <Text style={styles.title}>Tạo Quiz bằng AI</Text>
        </View>
        <View style={styles.backBtnPlaceholder} />
      </View>

      {/* Basic Settings Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>1. Cấu hình Quiz chung</Text>

        <Input
          label="Tiêu đề Quiz"
          placeholder="Nhập tiêu đề cho bài kiểm tra của bạn..."
          value={form.title}
          onChangeText={(text) => updateField("title", text)}
          error={errors.title}
        />

        <Input
          label="Mô tả Quiz (Không bắt buộc)"
          placeholder="Giới thiệu khái quát về nội dung bài kiểm tra..."
          value={form.description}
          onChangeText={(text) => updateField("description", text)}
          error={errors.description}
        />

        {/* Custom Category Selection */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>Danh mục chủ đề</Text>
          <Pressable
            style={[
              styles.selectBox,
              categoryModalVisible && styles.selectBoxActive,
              !!errors.category_id && styles.selectBoxError,
            ]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text
              style={[
                styles.selectText,
                form.category_id === null && styles.selectPlaceholder,
              ]}
            >
              {getSelectedCategoryName()}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </Pressable>
          {errors.category_id ? (
            <Text style={styles.errorText}>{errors.category_id}</Text>
          ) : null}
        </View>

        {/* Difficulty Selection */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>Mức độ khó</Text>
          <View style={styles.difficultyGroup}>
            {difficulties.map((diff) => {
              const active = form.difficulty === diff;
              return (
                <TouchableOpacity
                  key={diff}
                  onPress={() => updateField("difficulty", diff)}
                  style={[
                    styles.difficultyTab,
                    active && styles.difficultyTabActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.difficultyTabText,
                      active && styles.difficultyTabTextActive,
                    ]}
                  >
                    {difficultyLabels[diff]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Numeric rows */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Input
              label="Thời gian (phút)"
              placeholder="15"
              value={form.duration}
              onChangeText={(text) => updateField("duration", text)}
              error={errors.duration}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.col}>
            <Input
              label="Điểm đạt (%)"
              placeholder="70"
              value={form.passing_score}
              onChangeText={(text) => updateField("passing_score", text)}
              error={errors.passing_score}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.col}>
            <Input
              label="Số lượt làm"
              placeholder="3"
              value={form.max_attempts}
              onChangeText={(text) => updateField("max_attempts", text)}
              error={errors.max_attempts}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Generation Method Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>2. Phương thức tạo câu hỏi</Text>

        {/* Mode Switch Tabs */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, form.mode === "prompt" && styles.modeTabActive]}
            onPress={() => updateField("mode", "prompt")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={form.mode === "prompt" ? "#4F46E5" : "#64748B"}
            />
            <Text
              style={[
                styles.modeTabText,
                form.mode === "prompt" && styles.modeTabTextActive,
              ]}
            >
              Nhập yêu cầu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, form.mode === "file" && styles.modeTabActive]}
            onPress={() => updateField("mode", "file")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="document-attach-outline"
              size={18}
              color={form.mode === "file" ? "#4F46E5" : "#64748B"}
            />
            <Text
              style={[
                styles.modeTabText,
                form.mode === "file" && styles.modeTabTextActive,
              ]}
            >
              Tải tài liệu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Prompt Mode Fields */}
        {form.mode === "prompt" ? (
          <View style={styles.methodContent}>
            <Text style={styles.fieldLabel}>Mô tả yêu cầu chi tiết</Text>
            <Input
              placeholder="Ví dụ: Hãy tạo bài kiểm tra gồm 10 câu hỏi về lập trình React Native cơ bản, tập trung vào React Hooks và state management..."
              value={form.prompt}
              onChangeText={(text) => updateField("prompt", text)}
              error={errors.prompt}
              variant="default"
              containerStyle={{ marginBottom: 4 }}
              autoCorrect
              autoCapitalize="sentences"
            />
            <Text style={styles.charCount}>
              {form.prompt.length}/2000 ký tự (Tối thiểu 10 ký tự)
            </Text>
          </View>
        ) : (
          /* File Mode Fields */
          <View style={styles.methodContent}>
            <Text style={styles.fieldLabel}>Tải file học liệu lên</Text>
            {form.file ? (
              <View style={styles.fileDetailBox}>
                <Ionicons name="document-text" size={32} color="#4F46E5" />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {form.file.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {form.file.size
                      ? `${(form.file.size / (1024 * 1024)).toFixed(2)} MB`
                      : "Không xác định"}
                  </Text>
                </View>
                <TouchableOpacity style={styles.removeFileBtn} onPress={removeFile}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <Pressable
                style={[styles.uploadArea, !!errors.file && styles.uploadAreaError]}
                onPress={pickDocument}
              >
                <Ionicons name="cloud-upload-outline" size={36} color="#4F46E5" />
                <Text style={styles.uploadTitle}>Chọn file từ điện thoại</Text>
                <Text style={styles.uploadSubtitle}>
                  Hỗ trợ định dạng .pdf, .doc, .docx, .txt (Tối đa 10MB)
                </Text>
              </Pressable>
            )}
            {errors.file ? <Text style={styles.errorText}>{errors.file}</Text> : null}
          </View>
        )}

        {/* Number of Questions */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>Số lượng câu hỏi</Text>
          <View style={styles.questionsControl}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() =>
                updateField(
                  "number_of_questions",
                  Math.max(1, form.number_of_questions - 1)
                )
              }
            >
              <Ionicons name="remove" size={18} color="#0F172A" />
            </TouchableOpacity>

            <Text style={styles.questionNumText}>{form.number_of_questions}</Text>

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() =>
                updateField(
                  "number_of_questions",
                  Math.min(20, form.number_of_questions + 1)
                )
              }
            >
              <Ionicons name="add" size={18} color="#0F172A" />
            </TouchableOpacity>

            <View style={styles.presets}>
              {questionPresets.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => updateField("number_of_questions", preset)}
                  style={[
                    styles.presetBtn,
                    form.number_of_questions === preset && styles.presetBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      form.number_of_questions === preset &&
                        styles.presetTextActive,
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* General Submission Error */}
      {errors.general ? (
        <View style={styles.generalErrorBox}>
          <Ionicons name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.generalErrorText}>{errors.general}</Text>
        </View>
      ) : null}

      {/* Submit Action */}
      <TouchableOpacity
        style={styles.submitBtn}
        disabled={isGenerating}
        onPress={onSubmit}
        activeOpacity={0.85}
      >
        <Ionicons name="sparkles" size={18} color="#FFFFFF" />
        <Text style={styles.submitBtnText}>Tạo Quiz bằng AI</Text>
      </TouchableOpacity>

      {/* Category Dropdown List Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCategoryModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Danh mục chủ đề</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {isCategoriesLoading ? (
              <Text style={styles.loadingCats}>Đang tải danh sách...</Text>
            ) : categories.length === 0 ? (
              <Text style={styles.loadingCats}>Không có danh mục nào.</Text>
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      form.category_id === Number(item.id) &&
                        styles.modalOptionActive,
                    ]}
                    onPress={() => {
                      updateField("category_id", Number(item.id));
                      setCategoryModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        form.category_id === Number(item.id) &&
                          styles.modalOptionTextActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {form.category_id === Number(item.id) ? (
                      <Ionicons name="checkmark" size={20} color="#4F46E5" />
                    ) : null}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
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
  backBtnPlaceholder: {
    width: 44,
  },
  headerTitleWrap: {
    alignItems: "center",
    flex: 1,
  },
  aiBadge: {
    backgroundColor: "rgba(6,182,212,0.08)",
    borderColor: "rgba(6,182,212,0.18)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  aiBadgeText: {
    color: "#0891B2",
    fontSize: 9,
    fontWeight: "800",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.65)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textMuted,
    marginBottom: 8,
    marginLeft: 4,
  },
  selectBox: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 17,
    borderColor: "rgba(203,213,225,0.65)",
    backgroundColor: "rgba(255,255,255,0.82)",
    paddingHorizontal: 16,
  },
  selectBoxActive: {
    borderColor: "#4F46E5",
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  selectBoxError: {
    borderColor: "rgba(239,68,68,0.48)",
  },
  selectText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0F172A",
  },
  selectPlaceholder: {
    color: Colors.textMuted,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    marginLeft: 6,
  },
  difficultyGroup: {
    flexDirection: "row",
    gap: 8,
  },
  difficultyTab: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(241,245,249,0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  difficultyTabActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#4F46E5",
  },
  difficultyTabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  difficultyTabTextActive: {
    color: "#4F46E5",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  col: {
    flex: 1,
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "rgba(241,245,249,0.7)",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
    borderRadius: 11,
  },
  modeTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  modeTabTextActive: {
    color: "#4F46E5",
  },
  methodContent: {
    marginBottom: 16,
  },
  charCount: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "right",
    marginRight: 4,
  },
  uploadArea: {
    height: 140,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(79,70,229,0.3)",
    backgroundColor: "rgba(79,70,229,0.02)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  uploadAreaError: {
    borderColor: "rgba(239,68,68,0.48)",
    backgroundColor: "rgba(239,68,68,0.02)",
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4F46E5",
    marginTop: 10,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
  },
  fileDetailBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "rgba(79,70,229,0.18)",
    borderRadius: 16,
    padding: 16,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  fileSize: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  removeFileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFEBEB",
    alignItems: "center",
    justifyContent: "center",
  },
  questionsControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  questionNumText: {
    width: 48,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  presets: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "flex-end",
    gap: 6,
  },
  presetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(241,245,249,0.7)",
  },
  presetBtnActive: {
    backgroundColor: "#4F46E5",
  },
  presetText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  presetTextActive: {
    color: "#FFFFFF",
  },
  generalErrorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFE2E2",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  generalErrorText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  submitBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 3,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  loadingCats: {
    paddingVertical: 30,
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalOptionActive: {
    backgroundColor: "#F8FAFC",
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },
  modalOptionTextActive: {
    color: "#4F46E5",
    fontWeight: "700",
  },
});
