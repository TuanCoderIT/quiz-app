import { useState, useEffect, useCallback } from "react";
import * as DocumentPicker from "expo-document-picker";
import { isAxiosError } from "axios";
import { getCategories } from "../../quiz/api";
import { Category } from "../../../types/category";
import {
  AIQuizFormState,
  AIQuizFormErrors,
  AIQuizDetail,
  AIQuizFromPromptPayload,
} from "../ai.types";
import { generateQuizFromPrompt, generateQuizFromFile } from "../ai.api";

const INITIAL_FORM_STATE: AIQuizFormState = {
  title: "",
  description: "",
  category_id: null,
  difficulty: "Beginner",
  duration: "15",
  passing_score: "70",
  max_attempts: "3",
  mode: "prompt",
  prompt: "",
  file: null,
  number_of_questions: 10,
};

export const useAIQuizForm = () => {
  const [form, setForm] = useState<AIQuizFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<AIQuizFormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    try {
      const fetched = await getCategories();
      // Filter out 'All' or normalize
      const activeCategories = fetched.filter(
        (cat) => cat.id !== "all" && cat.id !== "All"
      );
      setCategories(activeCategories);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setErrors((prev) => ({
        ...prev,
        category_id: "Không thể tải danh mục. Vui lòng tải lại trang.",
      }));
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Update Field Handler
  const updateField = useCallback(
    <K extends keyof AIQuizFormState>(field: K, value: AIQuizFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      // Clear specific error when editing
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof AIQuizFormErrors];
        delete next.general;
        return next;
      });
    },
    []
  );

  // Document Picker Handler
  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      if (!asset) return;

      // Validate extension
      const fileName = asset.name.toLowerCase();
      const validExtensions = [".pdf", ".doc", ".docx", ".txt"];
      const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

      if (!hasValidExt) {
        setErrors((prev) => ({
          ...prev,
          file: "Định dạng file không hỗ trợ. Chỉ nhận .pdf, .doc, .docx, .txt",
        }));
        return;
      }

      // Validate size (10 MB = 10 * 1024 * 1024 bytes)
      if (asset.size && asset.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          file: "Kích thước file vượt quá 10MB.",
        }));
        return;
      }

      updateField("file", asset);
    } catch (err) {
      console.error("Failed to pick document:", err);
      setErrors((prev) => ({
        ...prev,
        file: "Không thể chọn file. Vui lòng thử lại.",
      }));
    }
  }, [updateField]);

  // Remove Selected File
  const removeFile = useCallback(() => {
    updateField("file", null);
  }, [updateField]);

  // Validate form inputs
  const validate = useCallback((): boolean => {
    const nextErrors: AIQuizFormErrors = {};
    let isValid = true;

    if (!form.title.trim()) {
      nextErrors.title = "Tiêu đề không được để trống";
      isValid = false;
    }

    if (form.category_id === null) {
      nextErrors.category_id = "Vui lòng chọn danh mục";
      isValid = false;
    }

    const durationNum = Number(form.duration);
    if (!form.duration.trim() || Number.isNaN(durationNum) || durationNum <= 0) {
      nextErrors.duration = "Thời gian làm bài phải lớn hơn 0";
      isValid = false;
    }

    const passingScoreNum = Number(form.passing_score);
    if (
      !form.passing_score.trim() ||
      Number.isNaN(passingScoreNum) ||
      passingScoreNum < 0 ||
      passingScoreNum > 100
    ) {
      nextErrors.passing_score = "Điểm đạt phải từ 0 đến 100";
      isValid = false;
    }

    const maxAttemptsNum = Number(form.max_attempts);
    if (
      !form.max_attempts.trim() ||
      Number.isNaN(maxAttemptsNum) ||
      maxAttemptsNum < 0
    ) {
      nextErrors.max_attempts = "Lượt làm bài phải lớn hơn hoặc bằng 0";
      isValid = false;
    }

    if (form.number_of_questions < 1 || form.number_of_questions > 20) {
      nextErrors.number_of_questions = "Số lượng câu hỏi phải từ 1 đến 20";
      isValid = false;
    }

    if (form.mode === "prompt") {
      if (!form.prompt.trim()) {
        nextErrors.prompt = "Nội dung yêu cầu không được để trống";
        isValid = false;
      } else if (form.prompt.length < 10) {
        nextErrors.prompt = "Yêu cầu phải tối thiểu 10 ký tự";
        isValid = false;
      } else if (form.prompt.length > 2000) {
        nextErrors.prompt = "Yêu cầu không được vượt quá 2000 ký tự";
        isValid = false;
      }
    } else {
      if (!form.file) {
        nextErrors.file = "Vui lòng đính kèm tài liệu";
        isValid = false;
      }
    }

    setErrors(nextErrors);
    return isValid;
  }, [form]);

  // Submit Generation Request
  const submit = useCallback(async (): Promise<AIQuizDetail | null> => {
    if (!validate() || isGenerating) {
      return null;
    }

    setIsGenerating(true);
    setErrors({});

    try {
      if (form.mode === "prompt") {
        const payload: AIQuizFromPromptPayload = {
          prompt: form.prompt,
          number_of_questions: form.number_of_questions,
          title: form.title,
          description: form.description || undefined,
          category_id: Number(form.category_id),
          difficulty: form.difficulty,
          duration: Number(form.duration),
          passing_score: Number(form.passing_score),
          max_attempts: Number(form.max_attempts),
          color: "#4F46E5",
        };

        const res = await generateQuizFromPrompt(payload);
        return res.data;
      } else {
        const formData = new FormData();
        if (form.file) {
          formData.append("file", {
            uri: form.file.uri,
            name: form.file.name,
            type: form.file.mimeType || "application/octet-stream",
          } as any);
        }
        formData.append("title", form.title);
        if (form.description) {
          formData.append("description", form.description);
        }
        formData.append("category_id", String(form.category_id));
        formData.append("difficulty", form.difficulty);
        formData.append("duration", String(form.duration));
        formData.append("passing_score", String(form.passing_score));
        formData.append("max_attempts", String(form.max_attempts));
        formData.append("number_of_questions", String(form.number_of_questions));
        formData.append("color", "#4F46E5");

        const res = await generateQuizFromFile(formData);
        return res.data;
      }
    } catch (err) {
      console.error("Quiz generation failed:", err);
      if (isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 422 && data && data.errors) {
          // Laravel validation errors format
          const validationErrors: AIQuizFormErrors = {};
          Object.entries(data.errors).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              validationErrors[key as keyof AIQuizFormErrors] = value[0];
            }
          });
          setErrors(validationErrors);
        } else if (status === 422 && data && data.message) {
          setErrors({ general: data.message });
        } else {
          setErrors({
            general: "Lỗi kết nối máy chủ hoặc máy chủ gặp lỗi (500).",
          });
        }
      } else {
        setErrors({
          general: "Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền.",
        });
      }
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [form, validate, isGenerating]);

  // Reset Form
  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM_STATE);
    setErrors({});
  }, []);

  return {
    form,
    errors,
    categories,
    isCategoriesLoading,
    isGenerating,
    updateField,
    pickDocument,
    removeFile,
    submit,
    resetForm,
    fetchCategories,
  };
};
