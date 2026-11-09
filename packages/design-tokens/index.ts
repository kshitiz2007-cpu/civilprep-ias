export const civilPrepThemes = {
  dawn: { canvas: "#FAF7F2", surface: "#F2ECE1", ink: "#1C242B", sage: "#1F4E43", terracotta: "#C85A32", indigo: "#2B4C7E" },
  midnight: { canvas: "#11181C", surface: "#182228", ink: "#E6E1D6", sage: "#52B788", terracotta: "#F4A261", indigo: "#7494EA" },
} as const;
export type CivilPrepTheme = keyof typeof civilPrepThemes;
export type CivilPrepThemeTokens = (typeof civilPrepThemes)[CivilPrepTheme];
/** Backwards-compatible Dawn palette for existing consumers. */
export const civilPrepColors = {
  canvas: civilPrepThemes.dawn.canvas, surface: "#FAFCF8", surfaceWarm: civilPrepThemes.dawn.surface,
  terracotta: civilPrepThemes.dawn.terracotta, orange: civilPrepThemes.dawn.terracotta, sage: "#A7B99A",
  forest: civilPrepThemes.dawn.sage, indigo: civilPrepThemes.dawn.indigo, ink: civilPrepThemes.dawn.ink,
  mutedInk: "#58636A", border: "#DED6CA",
} as const;
