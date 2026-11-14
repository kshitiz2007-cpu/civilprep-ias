"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "rose" | "champagne" | "magenta";
type ThemeContextValue = {
  preference: ThemePreference;
  activeTheme: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "civilprep-visual-theme";

export function ZenithThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("rose");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "rose" || saved === "champagne" || saved === "magenta") setPreferenceState(saved);
    } catch {
      // The default Rose Atelier theme remains available without storage.
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = preference;
    document.documentElement.style.colorScheme = "light";
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Keep the selected appearance for the current session.
    }
  }, []);

  const value = useMemo(() => ({ preference, activeTheme: preference, setPreference }), [preference, setPreference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useZenithTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useZenithTheme must be used inside ZenithThemeProvider.");
  return context;
}

export function ZenithThemeControl() {
  const { preference, setPreference } = useZenithTheme();
  return (
    <label className="zenith-theme-control">
      <span>Ambience</span>
      <select aria-label="Choose visual ambience" value={preference} onChange={(event) => setPreference(event.target.value as ThemePreference)}>
        <option value="rose">Rose Atelier</option>
        <option value="champagne">Champagne Glow</option>
        <option value="magenta">Magenta Bloom</option>
      </select>
    </label>
  );
}
