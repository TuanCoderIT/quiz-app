export const Colors = {
  // ─── Primary (Indigo) ──────────────────────────────────────────────────────
  primary: {
    50:      '#EEEDFB',
    100:     '#D4D3F6',
    200:     '#A9A6ED',
    300:     '#7E7AE4',
    400:     '#534DDB',
    DEFAULT: '#4F46E5',
    600:     '#3E38B4',
    700:     '#2E2A84',
    800:     '#1E1C54',
    900:     '#0F0E2A',
  },

  // ─── Secondary (Emerald) ───────────────────────────────────────────────────
  secondary: {
    DEFAULT: '#10B981',
    600:     '#059669',
  },

  // ─── Backgrounds ───────────────────────────────────────────────────────────
  background: '#F9FAFB',
  backgroundDark: '#111827',

  // ─── Surfaces ──────────────────────────────────────────────────────────────
  surface: '#FFFFFF',
  surfaceDark: '#1F2937',

  // ─── Text ──────────────────────────────────────────────────────────────────
  textPrimary:   '#111827',
  textSecondary: '#6B7280',
  textDisabled:  '#9CA3AF',
  textInverse:   '#FFFFFF',

  // ─── Borders ───────────────────────────────────────────────────────────────
  border:     '#E5E7EB',
  borderFocus: '#4F46E5',

  // ─── Semantic ──────────────────────────────────────────────────────────────
  error:   '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  info:    '#3B82F6',

  // ─── Neutrals ──────────────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;
