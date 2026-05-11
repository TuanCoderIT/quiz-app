// ─── User ───────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: 'student' | 'instructor' | 'admin';
  createdAt: string;
}

// ─── Auth State ──────────────────────────────────────────────────────────────
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

// ─── Login ───────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
