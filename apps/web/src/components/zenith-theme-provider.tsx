"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "auto" | "dawn" | "midnight";
type ActiveTheme = "dawn" | "midnight";

interface ThemeContextValue {
  preference: ThemePreference;
  activeTheme: ActiveTheme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "civilprep-theme-preference";

function themeForLocalTime(date: Date): ActiveTheme {
  const hour = date.getHours();
  return hour >= 6 && hour < 18 ? "dawn" : "midnight";
}

export function ZenithThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("auto");
  const [activeTheme, setActiveTheme] = useState<ActiveTheme>("dawn");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "auto" || saved === "dawn" || saved === "midnight") {
        setPreferenceState(saved);
      }
    } catch {
      // Storage may be unavailable in private browsing; the in-memory preference still works.
    }
  }, []);

  useEffect(() => {
    const update = () => {
      setActiveTheme(preference === "auto" ? themeForLocalTime(new Date()) : preference);
    };
    update();
    if (preference !== "auto") return;
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [preference]);

  useEffect(() => {
    document.documentElement.dataset.theme = activeTheme;
    document.documentElement.style.colorScheme = activeTheme === "dawn" ? "light" : "dark";
  }, [activeTheme]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Keep the selected preference for this session when storage is unavailable.
    }
  }, []);

  const value = useMemo(() => ({ preference, activeTheme, setPreference }), [preference, activeTheme, setPreference]);
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
      <span>Appearance</span>
      <select aria-label="Choose appearance" value={preference} onChange={(event) => setPreference(event.target.value as ThemePreference)}>
        <option value="auto">Auto · Circadian</option>
        <option value="dawn">Dawn Sanctuary</option>
        <option value="midnight">Midnight Study</option>
      </select>
    </label>
  );
}
