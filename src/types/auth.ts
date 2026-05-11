// ─── 1. USER TYPES ──────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin' | string; // Linh hoạt theo cả 2 định nghĩa
  avatar: string | null;
  bio?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  phone_number?: string | null;
  created_at: string; // Đồng bộ snake_case từ Laravel API
  updated_at?: string;
}

// Chi tiết thông tin cá nhân và thành tích (Dùng cho màn hình Profile/Progress)
export interface UserProfile extends User {
  total_quizzes_completed?: number;
  average_accuracy?: number;
  total_learning_time?: number;
  current_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  achievements?: Achievement[];
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  category: string;
}

// ─── 2. AUTH STATE (ZUSTAND STORE) ──────────────────────────────────────────
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>; // Truyền email/password để store tự gọi API
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>; // Kiểm tra token cũ khi mở app
}

// ─── 3. API PAYLOADS & RESPONSES ─────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Định nghĩa cấu trúc file ảnh chọn từ thiết bị di động
export interface MobileFile {
  uri: string;
  name?: string;
  type?: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  phone_number?: string;
  avatar?: MobileFile; // Đã đổi từ File thành MobileFile để tương thích Expo
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}