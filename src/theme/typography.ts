import { Platform } from "react-native"

export const typography = {
  fontFamily: Platform.select({
    ios: "SF Pro Display",
    android: "Inter",
    default: "Inter",
  }),

  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,

  // Font weights
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,

  // Typography styles
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  body: 16,
  caption: 12,
  small: 10,
  label: 14,
  button: 16,
} as const
