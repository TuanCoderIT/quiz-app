import { axiosAPI } from "../../services/api/client";
import { AIQuizFromPromptPayload, QuizGenerationResponse } from "./ai.types";

/**
 * Generate a quiz from a text prompt.
 * POST /api/user/exams/ai-generate-from-prompt
 */
// export const generateQuizFromPrompt = async (
//   payload: AIQuizFromPromptPayload
// ): Promise<QuizGenerationResponse> => {
//   const response = await axiosAPI.post<QuizGenerationResponse>(
//     "/user/exams/ai-generate-from-prompt",
//     payload
//   );
//   return response.data;
// };
export const generateQuizFromPrompt = async (
  payload: AIQuizFromPromptPayload,
): Promise<QuizGenerationResponse> => {
  try {
    console.log("AI quiz payload:", JSON.stringify(payload, null, 2));

    const response = await axiosAPI.post<QuizGenerationResponse>(
      "/user/exams/ai-generate-from-prompt",
      payload,
    );

    console.log("AI quiz response:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error: any) {
    console.log("AI quiz status:", error?.response?.status);
    console.log(
      "AI quiz validation:",
      JSON.stringify(error?.response?.data, null, 2),
    );

    throw error;
  }
};

/**
 * Generate a quiz from a uploaded document file.
 * POST /api/user/exams/ai-generate-from-file
 */
export const generateQuizFromFile = async (
  formData: FormData,
): Promise<QuizGenerationResponse> => {
  const response = await axiosAPI.post<QuizGenerationResponse>(
    "/user/exams/ai-generate-from-file",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};
