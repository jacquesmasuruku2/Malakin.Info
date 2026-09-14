'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'blue' | 'gray' | 'dark' | 'green' | 'purple' | 'orange';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEMES: Theme[] = ['blue', 'gray', 'dark', 'green', 'purple', 'orange'];

function isTheme(value: string | null): value is Theme {
  return THEMES.includes(value as Theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('blue');

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (isTheme(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('admin-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
