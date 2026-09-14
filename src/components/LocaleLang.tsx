'use client';

import { useEffect } from 'react';
import { normalizeLocale } from '@/lib/i18n';

export default function LocaleLang({ locale }: { locale: string }) {
  useEffect(() => {
    const normalized = normalizeLocale(locale);
    document.documentElement.lang = normalized;
    document.cookie = `app-locale=${normalized}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem('app-locale', normalized);
  }, [locale]);

  return null;
}
