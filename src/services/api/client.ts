import { create } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";
console.log("DEBUG: Base URL is set to:", BASE_URL);

export const axiosAPI = create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
});

// Request Interceptor
axiosAPI.interceptors.request.use(
  async (config) => {
    try {
      const authData = await AsyncStorage.getItem("auth-storage");
      if (authData) {
        const { state } = JSON.parse(authData);
        if (state && state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch (error) {
      console.error("Lỗi lấy token từ storage:", error);
    }
    console.log(`DEBUG: Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for debugging
axiosAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isExpectedClientError = status === 401 || status === 422;

    if (__DEV__ && !isExpectedClientError) {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        console.warn("API Error Status:", error.response.status);
        console.warn("API Error Data:", error.response.data);
      } else if (error.request) {
        // Request was made but no response was received
        console.warn("API No Response. Request URL:", error.config.url);
      } else {
        console.warn("API Setup Error:", error.message);
      }
    }

    return Promise.reject(error);
  }
);
