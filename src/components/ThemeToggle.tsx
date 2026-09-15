'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/client-auth';
import { useAccountUser } from '@/lib/use-account-user';
import { applyTheme, getStoredTheme, THEME_CHANGED_EVENT, type SiteTheme } from '@/lib/theme';

export default function ThemeToggle() {
  const { user, ready } = useAccountUser();
  const [theme, setTheme] = useState<SiteTheme>('light');

  useEffect(() => {
    const syncTheme = () => setTheme(getStoredTheme());
    syncTheme();
    window.addEventListener(THEME_CHANGED_EVENT, syncTheme);
    return () => window.removeEventListener(THEME_CHANGED_EVENT, syncTheme);
  }, []);

  if (!ready || !user) {
    return null;
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    authFetch('/api/user/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: next }),
    }).catch(() => {
      // Theme still applies locally if the save fails.
    });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/70 text-foreground transition hover:border-secondary hover:bg-muted"
      aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4 text-secondary" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
