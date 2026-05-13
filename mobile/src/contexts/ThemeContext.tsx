import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Appearance } from 'react-native';
import * as Storage from '../utils/storage';
import { darkTheme, lightTheme, Theme, ThemeMode } from '../theme';

const THEME_KEY = 'zero.theme';

interface ThemeState {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggle: () => Promise<void>;
}

const Ctx = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemMode = Appearance.getColorScheme() === 'light' ? 'light' : 'dark';
  const [mode, setModeState] = useState<ThemeMode>(systemMode);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Storage.get(THEME_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark') setModeState(stored);
      })
      .finally(() => setReady(true));
  }, []);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    await Storage.set(THEME_KEY, next);
  }, []);

  const toggle = useCallback(async () => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    await setMode(next);
  }, [mode, setMode]);

  const value = useMemo<ThemeState>(() => ({
    theme: mode === 'light' ? lightTheme : darkTheme,
    mode,
    setMode,
    toggle,
  }), [mode, setMode, toggle]);

  if (!ready) return null;

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme precisa estar dentro de ThemeProvider');
  return ctx;
}
