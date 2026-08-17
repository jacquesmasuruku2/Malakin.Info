'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import LanguageSelector, { ApplicationLocale } from './LanguageSelector';
import { getLocaleFromPathname, getLocalizedPath, normalizeLocale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = useMemo(() => {
    const locale = getLocaleFromPathname(pathname);
    return normalizeLocale(locale) as ApplicationLocale;
  }, [pathname]);

  const handleChange = (nextLocale: ApplicationLocale) => {
    const normalized = normalizeLocale(nextLocale);
    localStorage.setItem('preferred-locale', normalized);
    router.push(getLocalizedPath(pathname || '/', normalized));
  };

  return (
    <div className="w-[180px]">
      <LanguageSelector value={currentLocale} onChange={handleChange} />
    </div>
  );
}
