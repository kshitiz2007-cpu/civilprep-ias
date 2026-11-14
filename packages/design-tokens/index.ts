export const civilPrepThemes = {
  rose: { canvas: "#fff8f7", surface: "#ffffff", ink: "#38202d", accent: "#c83e7d", accentSoft: "#f8e5ed", gold: "#bd9258" },
  champagne: { canvas: "#fffaf1", surface: "#ffffff", ink: "#3b3028", accent: "#a9783d", accentSoft: "#f6eddc", gold: "#c49a5a" },
  magenta: { canvas: "#fff7fb", surface: "#ffffff", ink: "#351d31", accent: "#a82c79", accentSoft: "#f8e3f0", gold: "#c28a9e" },
  /** Backwards-compatible aliases for legacy theme consumers. */
  dawn: { canvas: "#fff8f7", surface: "#ffffff", ink: "#38202d", accent: "#c83e7d", accentSoft: "#f8e5ed", gold: "#bd9258" },
  midnight: { canvas: "#fff7fb", surface: "#ffffff", ink: "#351d31", accent: "#a82c79", accentSoft: "#f8e3f0", gold: "#c28a9e" },
} as const;
export type CivilPrepTheme = keyof typeof civilPrepThemes;
export type CivilPrepThemeTokens = (typeof civilPrepThemes)[CivilPrepTheme];
/** Backwards-compatible palette export for existing consumers. */
export const civilPrepColors = {
  canvas: civilPrepThemes.rose.canvas,
  surface: civilPrepThemes.rose.surface,
  surfaceWarm: "#fff0f2",
  terracotta: civilPrepThemes.rose.accent,
  orange: "#d65d91",
  sage: "#6d8b75",
  forest: "#6d8b75",
  indigo: "#876a98",
  ink: civilPrepThemes.rose.ink,
  mutedInk: "#876f7d",
  border: "#ead5df",
} as const;
