import { axiosAPI } from "../../services/api/client"; // Đã hướng về file client mới của Mobile
// Bạn có thể import type từ src/types/auth.ts mà bạn đã định nghĩa cho Mobile
import { UpdateProfileData, ChangePasswordData } from "../../types/auth"; 

export const fetchUser = async () => {
  const res = await axiosAPI.get("/user");
  return res.data;
};

export const loginApi = async (email: string, password: string) => {
  const res = await axiosAPI.post("/login", { email, password });
  return res.data;
};

export const registerApi = async (
  name: string,
  email: string,
  password: string
) => {
  const res = await axiosAPI.post("/register", {
    name,
    email,
    password,
    password_confirmation: password,
  });
  return res.data;
};

export const logoutApi = async () => {
  await axiosAPI.post("/logout");
};

export const updateProfileApi = async (formData: UpdateProfileData) => {
  const payload = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // KIỂM TRA LƯU Ý TRÊN MOBILE: 
      // Nếu value là một đối tượng chọn ảnh từ thư viện của điện thoại (ví dụ từ expo-image-picker)
      if (key === "avatar" && typeof value === "object" && (value as any).uri) {
        const fileValue = value as any;
        payload.append("avatar", {
          uri: fileValue.uri,
          name: fileValue.fileName || "avatar.jpg",
          type: fileValue.mimeType || "image/jpeg",
        } as any);
      } else {
        payload.append(key, value as any);
      }
    }
  });

  // Hỗ trợ Laravel nhận diện method PUT khi gửi qua FormData
  payload.append("_method", "PUT");

  const res = await axiosAPI.post("/profile", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const changePasswordApi = async (data: ChangePasswordData) => {
  const res = await axiosAPI.post("/change-password", data);
  return res.data;
};

export const getUserStatsApi = async () => {
  const res = await axiosAPI.get("/profile");
  return res.data;
};