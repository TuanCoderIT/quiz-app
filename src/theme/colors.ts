export const Colors = {
  // ─── Brand ────────────────────────────────────────────────────────────────
  primary: {
    50:      '#EEF2FF',
    100:     '#E0E7FF',
    200:     '#C7D2FE',
    300:     '#A5B4FC',
    400:     '#818CF8',
    DEFAULT: '#4F46E5',
    500:     '#4F46E5',
    600:     '#4338CA',
    700:     '#3730A3',
    800:     '#312E81',
    900:     '#1E1B4B',
  },

  secondary: {
    50:      '#ECFEFF',
    100:     '#CFFAFE',
    200:     '#A5F3FC',
    DEFAULT: '#06B6D4',
    500:     '#06B6D4',
    600:     '#0891B2',
  },

  premium: {
    50:      '#F5F3FF',
    100:     '#EDE9FE',
    DEFAULT: '#7C3AED',
    500:     '#7C3AED',
    600:     '#6D28D9',
  },

  // ─── Backgrounds ───────────────────────────────────────────────────────────
  background: '#F8FAFC',
  backgroundSoft: '#EEF2FF',
  backgroundDark: '#0F172A',

  // ─── Surfaces ──────────────────────────────────────────────────────────────
  surface: '#FFFFFF',
  surfaceDark: '#1E293B',
  card: 'rgba(255,255,255,0.68)',
  cardStrong: 'rgba(255,255,255,0.82)',
  cardBorder: 'rgba(255,255,255,0.7)',
  secondaryButton: '#EEF2FF',

  // ─── Text ──────────────────────────────────────────────────────────────────
  textPrimary:   '#0F172A',
  textSecondary: '#64748B',
  textMuted:     '#94A3B8',
  textDisabled:  '#94A3B8',
  textInverse:   '#FFFFFF',

  // ─── Borders ───────────────────────────────────────────────────────────────
  border:      'rgba(148,163,184,0.22)',
  borderLight: 'rgba(255,255,255,0.7)',
  borderFocus: '#4F46E5',

  // ─── Semantic ──────────────────────────────────────────────────────────────
  error:   '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  info:    '#06B6D4',

  // ─── Neutrals ──────────────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;
