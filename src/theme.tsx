import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';
export type AccentName = 'teal' | 'violet' | 'amber';

export type ThemeColors = {
  bg: string;
  card: string;
  card2: string;
  border: string;
  primary: string;
  primaryText: string;
  text: string;
  muted: string;
  danger: string;
  success: string;
  live: string;
  progress: string;
  academic: string;
  heroStart: string;
  heroEnd: string;
};

const accents: Record<AccentName, { dark: string; light: string }> = {
  teal: { dark: '#2dd4bf', light: '#0f766e' },
  violet: { dark: '#a78bfa', light: '#6d28d9' },
  amber: { dark: '#fbbf24', light: '#92400e' },
};

function makeColors(mode: ThemeMode, accent: AccentName): ThemeColors {
  const dark = mode === 'dark';
  return {
    bg: dark ? '#0a1020' : '#f3f5fa',
    card: dark ? '#121a2e' : '#ffffff',
    card2: dark ? '#1a243c' : '#eef1f8',
    border: dark ? '#27324d' : '#d9dfec',
    primary: accents[accent][mode],
    primaryText: dark ? '#04201c' : '#ffffff',
    text: dark ? '#eef2fb' : '#0e1527',
    muted: dark ? '#9fadc7' : '#4b5870',
    danger: dark ? '#f87171' : '#b42318',
    success: dark ? '#34d399' : '#047857',
    live: dark ? '#34d399' : '#047857',
    progress: dark ? '#fbbf24' : '#92400e',
    academic: dark ? '#93c5fd' : '#1d4ed8',
    heroStart: dark ? '#182947' : '#e1e9f7',
    heroEnd: dark ? '#0a1020' : '#ffffff',
  };
}

const colors = makeColors('dark', 'teal');
export { colors };

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const fontNames = {
  heading: 'BricolageGrotesque_800ExtraBold',
  body: 'Figtree_400Regular',
  bodySemibold: 'Figtree_600SemiBold',
};

let customFontsAvailable = false;
export function setCustomFontsAvailable(available: boolean) {
  customFontsAvailable = available;
}
export function getFontFamily(role: keyof typeof fontNames): string | undefined {
  return customFontsAvailable ? fontNames[role] : undefined;
}

export const font = { h1: 30, h2: 21, body: 15, small: 12 };

type ThemeContextValue = {
  mode: ThemeMode;
  accent: AccentName;
  colors: ThemeColors;
  ready: boolean;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentName) => void;
};

const STORAGE_KEY = 'solomon_portfolio_theme_v1';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [accent, setAccentState] = useState<AccentName>('teal');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const value: unknown = JSON.parse(raw);
        if (typeof value !== 'object' || value === null) return;
        const stored = value as Record<string, unknown>;
        if (stored.mode === 'dark' || stored.mode === 'light') setModeState(stored.mode);
        if (stored.accent === 'teal' || stored.accent === 'violet' || stored.accent === 'amber') {
          setAccentState(stored.accent);
        }
      })
      .catch((error: unknown) => {
        console.error('Could not load saved theme preferences.', error);
      })
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((nextMode: ThemeMode, nextAccent: AccentName) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: nextMode, accent: nextAccent })).catch((error: unknown) => {
      console.error('Could not save theme preferences.', error);
    });
  }, []);
  const setMode = useCallback((value: ThemeMode) => {
    setModeState(value);
    persist(value, accent);
  }, [accent, persist]);
  const setAccent = useCallback((value: AccentName) => {
    setAccentState(value);
    persist(mode, value);
  }, [mode, persist]);

  const value = useMemo(
    () => ({ mode, accent, colors: makeColors(mode, accent), ready, setMode, setAccent }),
    [accent, mode, ready, setAccent, setMode],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider.');
  return value;
}
