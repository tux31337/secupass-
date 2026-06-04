export const themeColors = {
  light: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceMuted: "#F4F4F5",
    surfaceContainer: "#FAFAFA",
    primary: "#18181B",
    primaryText: "#FFFFFF",
    primaryPressed: "#27272A",
    primarySoft: "#E4E4E7",
    primaryBorder: "#D4D4D8",
    textPrimary: "#171717",
    textSecondary: "#52525B",
    textMuted: "#71717A",
    border: "#E4E4E7",
    borderStrong: "#D4D4D8",
    successBackground: "#CCFBF1",
    successBorder: "#0F766E",
    successText: "#115E59",
    errorBackground: "#FEE2E2",
    errorBorder: "#DC2626",
    errorText: "#991B1B",
    backdrop: "rgba(23, 23, 23, 0.32)",
  },
  dark: {
    background: "#131316",
    surface: "#1B1B1E",
    surfaceMuted: "#252529",
    surfaceContainer: "#17171A",
    primary: "#E4E1E5",
    primaryText: "#18181B",
    primaryPressed: "#C7C6CA",
    primarySoft: "#303033",
    primaryBorder: "#3F3F46",
    textPrimary: "#E4E1E5",
    textSecondary: "#C7C6CA",
    textMuted: "#A1A1AA",
    border: "rgba(255, 255, 255, 0.1)",
    borderStrong: "#3F3F46",
    successBackground: "#134E4A",
    successBorder: "#5EEAD4",
    successText: "#CCFBF1",
    errorBackground: "#7F1D1D",
    errorBorder: "#F87171",
    errorText: "#FEE2E2",
    backdrop: "rgba(0, 0, 0, 0.56)",
  },
} as const;

export type ThemeColors = {
  readonly [Token in keyof (typeof themeColors)["light"]]: string;
};
export type ThemeMode = "light" | "dark" | null | undefined;

export function getThemeColors(colorScheme: ThemeMode): ThemeColors {
  return colorScheme === "dark" ? themeColors.dark : themeColors.light;
}

export const colors = themeColors.light;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 6,
  md: 8,
} as const;

export const touchTarget = {
  minHeight: 48,
} as const;
