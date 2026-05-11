import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://172.17.0.1:8000/api"; // Thay bằng IP máy của bạn nhé

export const axiosAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
});

axiosAPI.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Lỗi lấy token từ storage:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);