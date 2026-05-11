// src/stores/auth.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage của Mobile
import { loginApi, registerApi, logoutApi, fetchUser } from "../features/auth/api";
import { axiosAPI } from "../services/api/client";
import { AuthState } from "../types/auth"; // Sử dụng interface AuthState chuẩn của Mobile

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false, // Đồng bộ hóa tên biến isLoading từ file types/auth.ts

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await loginApi(email, password);
          set({ token: data.token, user: data.user });
          axiosAPI.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        } catch (error) {
          console.error("Lỗi đăng nhập:", error);
          throw error; // Quăng lỗi ra ngoài để UI hiển thị thông báo lỗi
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const data = await registerApi(name, email, password);
          set({ token: data.token, user: data.user });
          axiosAPI.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        } catch (error) {
          console.error("Lỗi đăng ký:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await logoutApi();
        } catch (err) {
          console.log("Lỗi gọi API logout (vẫn tiến hành xóa state dưới client):", err);
        } finally {
          set({ user: null, token: null });
          delete axiosAPI.defaults.headers.common["Authorization"];
          set({ isLoading: false });
        }
      },

      initializeAuth: async () => { // Đổi tên từ bootstrap thành initializeAuth để khớp với interface AuthState
        const token = get().token;
        if (token) {
          axiosAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          set({ isLoading: true });
          try {
            const user = await fetchUser();
            set({ user });
          } catch (err) {
            console.error("Lỗi khôi phục phiên đăng nhập:", err);
            get().logout(); // Token lỗi hoặc hết hạn thì tự động logout
          } finally {
            set({ isLoading: false });
          }
        }
      }
    }),
    {
      name: "auth-storage", // Tên key lưu trong AsyncStorage của điện thoại
      storage: createJSONStorage(() => AsyncStorage), // BẮT BUỘC: Ép Zustand sử dụng AsyncStorage thay vì localStorage của Web
      partialize: (state) => ({ token: state.token, user: state.user }), // Chỉ lưu trữ token và thông tin user dưới máy
    }
  )
);