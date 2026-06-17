import { axiosAPI } from "../../services/api/client";
import { AIQuizFromPromptPayload, QuizGenerationResponse } from "./ai.types";

/**
 * Generate a quiz from a text prompt.
 * POST /api/user/exams/ai-generate-from-prompt
 */
export const generateQuizFromPrompt = async (
  payload: AIQuizFromPromptPayload
): Promise<QuizGenerationResponse> => {
  const response = await axiosAPI.post<QuizGenerationResponse>(
    "/user/exams/ai-generate-from-prompt",
    payload
  );
  return response.data;
};

/**
 * Generate a quiz from a uploaded document file.
 * POST /api/user/exams/ai-generate-from-file
 */
export const generateQuizFromFile = async (
  formData: FormData
): Promise<QuizGenerationResponse> => {
  const response = await axiosAPI.post<QuizGenerationResponse>(
    "/user/exams/ai-generate-from-file",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
