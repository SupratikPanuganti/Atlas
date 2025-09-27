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
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Inter",
      default: "Inter",
    }),
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Inter",
      default: "Inter",
    }),
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Inter",
      default: "Inter",
    }),
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Inter",
      default: "Inter",
    }),
  },
  h5: {
    fontSize: 18,
    fontWeight: "600" as const,
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Inter",
      default: "Inter",
    }),
  },
  h6: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Inter",
      default: "Inter",
    }),
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Inter",
      default: "Inter",
    }),
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Inter",
      default: "Inter",
    }),
  },
  small: {
    fontSize: 10,
    fontWeight: "400" as const,
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Inter",
      default: "Inter",
    }),
  },
  label: {
    fontSize: 14,
    fontWeight: "500" as const,
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Inter",
      default: "Inter",
    }),
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Inter",
      default: "Inter",
    }),
  },
} as const
