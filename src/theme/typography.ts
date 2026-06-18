export const FontFamily = {
  thin: "Lexend-Thin",
  extraLight: "Lexend-ExtraLight",
  light: "Lexend-Light",
  regular: "Lexend-Regular",
  medium: "Lexend-Medium",
  semibold: "Lexend-SemiBold",
  bold: "Lexend-Bold",
  extrabold: "Lexend-ExtraBold",
  black: "Lexend-Black",
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
  h1: { fontFamily: FontFamily.bold, fontSize: FontSize['4xl'], lineHeight: FontSize['4xl'] * LineHeight.tight },
  h2: { fontFamily: FontFamily.bold, fontSize: FontSize['3xl'], lineHeight: FontSize['3xl'] * LineHeight.tight },
  h3: { fontFamily: FontFamily.semibold, fontSize: FontSize['2xl'], lineHeight: FontSize['2xl'] * LineHeight.tight },
  h4: { fontFamily: FontFamily.semibold, fontSize: FontSize.xl, lineHeight: FontSize.xl * LineHeight.normal },
  body: { fontFamily: FontFamily.regular, fontSize: FontSize.base, lineHeight: FontSize.base * LineHeight.normal },
  bodySmall: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: FontSize.sm * LineHeight.normal },
  caption: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, lineHeight: FontSize.xs * LineHeight.normal },
  button: { fontFamily: FontFamily.semibold, fontSize: FontSize.base },
  label: { fontFamily: FontFamily.medium, fontSize: FontSize.sm },
} as const;
