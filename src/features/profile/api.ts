import { axiosAPI } from "@/src/services/api/client";

export type UpdateProfilePayload = FormData;

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

export async function updateProfile(data: UpdateProfilePayload) {
  const response = await axiosAPI.post("/profile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function changePassword(data: ChangePasswordPayload) {
  const response = await axiosAPI.post("/change-password", data);
  return response.data;
}
