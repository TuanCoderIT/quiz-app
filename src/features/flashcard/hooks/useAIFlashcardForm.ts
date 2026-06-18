import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import * as DocumentPicker from "expo-document-picker";
import type { DocumentPickerAsset } from "expo-document-picker";

import { getCategories } from "../../quiz/api";
import { useNotificationStore } from "../../notification/store";
import { Category } from "../../../types/category";
import {
  generateFlashcardSetFromFile,
  generateFlashcardSetFromPrompt,
} from "../api";
import {
  AIFlashcardFromPromptPayload,
  AIFlashcardGenerationResponse,
  FlashcardSetVisibility,
} from "../types";

type AIFlashcardMode = "prompt" | "file";

export interface AIFlashcardFormState {
  title: string;
  description: string;
  category_id: number | null;
  visibility: FlashcardSetVisibility;
  mode: AIFlashcardMode;
  prompt: string;
  file: DocumentPickerAsset | null;
  number_of_cards: number;
}

export interface AIFlashcardFormErrors {
  title?: string;
  description?: string;
  category_id?: string;
  visibility?: string;
  prompt?: string;
  file?: string;
  number_of_cards?: string;
  general?: string;
}

const INITIAL_FORM_STATE: AIFlashcardFormState = {
  title: "",
  description: "",
  category_id: null,
  visibility: "private",
  mode: "prompt",
  prompt: "",
  file: null,
  number_of_cards: 10,
};

const getBackendMessage = (data: unknown) => {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    if (typeof record.message === "string") {
      return record.message;
    }

    if (typeof record.error === "string") {
      return record.error;
    }
  }

  return "AI could not generate the flashcard set. Please try again.";
};

export const useAIFlashcardForm = () => {
  const [form, setForm] = useState<AIFlashcardFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<AIFlashcardFormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsCategoriesLoading(true);

    try {
      const fetched = await getCategories();
      setCategories(
        fetched.filter((cat) => cat.id !== "all" && cat.id !== "All"),
      );
    } catch (error) {
      console.error("Failed to load flashcard categories:", error);
      setErrors((prev) => ({
        ...prev,
        category_id: "Không thể tải danh mục. Bạn vẫn có thể bỏ trống.",
      }));
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const updateField = useCallback(
    <K extends keyof AIFlashcardFormState>(
      field: K,
      value: AIFlashcardFormState[K],
    ) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof AIFlashcardFormErrors];
        delete next.general;
        return next;
      });
    },
    [],
  );

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
      if (!asset) {
        return;
      }

      const fileName = asset.name.toLowerCase();
      const validExtensions = [".pdf", ".doc", ".docx", ".txt"];
      const hasValidExtension = validExtensions.some((ext) =>
        fileName.endsWith(ext),
      );

      if (!hasValidExtension) {
        setErrors((prev) => ({
          ...prev,
          file: "Định dạng file không hỗ trợ. Chỉ nhận .pdf, .doc, .docx, .txt",
        }));
        return;
      }

      if (asset.size && asset.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          file: "Kích thước file vượt quá 10MB.",
        }));
        return;
      }

      updateField("file", asset);
    } catch (error) {
      console.error("Failed to pick flashcard document:", error);
      setErrors((prev) => ({
        ...prev,
        file: "Không thể chọn file. Vui lòng thử lại.",
      }));
    }
  }, [updateField]);

  const removeFile = useCallback(() => {
    updateField("file", null);
  }, [updateField]);

  const validate = useCallback(() => {
    const nextErrors: AIFlashcardFormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Tiêu đề không được để trống";
    }

    if (form.number_of_cards < 1 || form.number_of_cards > 30) {
      nextErrors.number_of_cards = "Số lượng thẻ phải từ 1 đến 30";
    }

    if (form.visibility !== "private" && form.visibility !== "public") {
      nextErrors.visibility = "Chế độ hiển thị không hợp lệ";
    }

    if (form.mode === "prompt") {
      if (!form.prompt.trim()) {
        nextErrors.prompt = "Nội dung yêu cầu không được để trống";
      }
    } else if (!form.file) {
      nextErrors.file = "Vui lòng đính kèm tài liệu";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form]);

  const getFileFormData = useCallback(
    (description: string | null) => {
      const formData = new FormData();

      if (form.file) {
        formData.append("file", {
          uri: form.file.uri,
          name: form.file.name,
          type: form.file.mimeType || "application/octet-stream",
        } as any);
      }

      formData.append("title", form.title.trim());
      formData.append("description", description ?? "");
      formData.append(
        "category_id",
        form.category_id === null ? "" : String(form.category_id),
      );
      formData.append("visibility", form.visibility);
      formData.append("number_of_cards", String(form.number_of_cards));

      return formData;
    },
    [form],
  );

  const submit =
    useCallback(async (): Promise<AIFlashcardGenerationResponse | null> => {
      if (!validate() || isGenerating) {
        return null;
      }

      setIsGenerating(true);
      setErrors({});

      try {
        const description = form.description.trim() || null;
        const response =
          form.mode === "prompt"
            ? await generateFlashcardSetFromPrompt({
                prompt: form.prompt.trim(),
                number_of_cards: form.number_of_cards,
                title: form.title.trim(),
                description,
                category_id: form.category_id,
                visibility: form.visibility,
              } satisfies AIFlashcardFromPromptPayload)
            : await generateFlashcardSetFromFile(getFileFormData(description));

        void useNotificationStore.getState().fetchUnreadCount();

        return response;
      } catch (error) {
        console.log(
          "AI flashcard status:",
          isAxiosError(error) ? error.response?.status : undefined,
        );
        console.log(
          "AI flashcard error:",
          JSON.stringify(
            isAxiosError(error) ? error.response?.data : undefined,
            null,
            2,
          ),
        );

        if (isAxiosError(error)) {
          const data = error.response?.data;
          const status = error.response?.status;

          if (status === 422) {
            setErrors({ general: getBackendMessage(data) });
          } else {
            setErrors({
              general:
                "AI could not generate the flashcard set. Please try again.",
            });
          }
        } else {
          setErrors({
            general:
              "AI could not generate the flashcard set. Please try again.",
          });
        }

        return null;
      } finally {
        setIsGenerating(false);
      }
    }, [form, getFileFormData, isGenerating, validate]);

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
  };
};
