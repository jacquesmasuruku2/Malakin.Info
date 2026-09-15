'use client';

import { useEffect } from 'react';
import { authFetch } from '@/lib/client-auth';
import { useAccountUser } from '@/lib/use-account-user';
import { applyTheme, clearTheme, getStoredTheme } from '@/lib/theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAccountUser();

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      clearTheme();
      return;
    }

    applyTheme(getStoredTheme());

    let cancelled = false;
    authFetch('/api/user/preferences')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled || !data?.theme) return;
        applyTheme(data.theme === 'dark' ? 'dark' : 'light');
      })
      .catch(() => {
        // Keep the locally stored theme if the API is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  return children;
}
