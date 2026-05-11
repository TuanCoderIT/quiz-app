import { Platform } from 'react-native';

export const FontFamily = {
  regular: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  medium:  Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'System' }),
  bold:    Platform.select({ ios: 'System', android: 'Roboto-Bold', default: 'System' }),
} as const;

export const FontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
} as const;

export const FontWeight = {
  regular:   '400',
  medium:    '500',
  semibold:  '600',
  bold:      '700',
  extrabold: '800',
} as const;

export const LineHeight = {
  tight:   1.25,
  normal:  1.5,
  relaxed: 1.75,
} as const;

// ─── Text Styles (composable) ─────────────────────────────────────────────────
export const TextStyles = {
  h1: { fontSize: FontSize['4xl'], fontWeight: FontWeight.bold,    lineHeight: FontSize['4xl'] * LineHeight.tight },
  h2: { fontSize: FontSize['3xl'], fontWeight: FontWeight.bold,    lineHeight: FontSize['3xl'] * LineHeight.tight },
  h3: { fontSize: FontSize['2xl'], fontWeight: FontWeight.semibold, lineHeight: FontSize['2xl'] * LineHeight.tight },
  h4: { fontSize: FontSize.xl,     fontWeight: FontWeight.semibold, lineHeight: FontSize.xl * LineHeight.normal },
  body:  { fontSize: FontSize.base, fontWeight: FontWeight.regular, lineHeight: FontSize.base * LineHeight.normal },
  bodySmall: { fontSize: FontSize.sm, fontWeight: FontWeight.regular, lineHeight: FontSize.sm * LineHeight.normal },
  caption: { fontSize: FontSize.xs,  fontWeight: FontWeight.regular, lineHeight: FontSize.xs * LineHeight.normal },
  button:  { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  label:   { fontSize: FontSize.sm,   fontWeight: FontWeight.medium },
} as const;
