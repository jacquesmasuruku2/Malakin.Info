'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { getLanguageOptions, getLocaleDisplayName, getLocalizedPath, normalizeLocale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('fr');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const locale = normalizeLocale(pathname?.split('/').filter(Boolean)[0] || 'fr');
    setCurrentLocale(locale);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const storedLocale = localStorage.getItem('preferred-locale');
    if (storedLocale) {
      const normalized = normalizeLocale(storedLocale);
      if (normalized !== currentLocale) {
        const localizedPath = getLocalizedPath(pathname || '/', normalized);
        router.replace(localizedPath);
      }
    }
  }, [currentLocale, pathname, router]);

  const options = useMemo(() => getLanguageOptions(), []);

  const handleSelect = (locale: string) => {
    const normalized = normalizeLocale(locale);
    localStorage.setItem('preferred-locale', normalized);
    setCurrentLocale(normalized);
    setIsOpen(false);
    router.push(getLocalizedPath(pathname || '/', normalized));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40 hover:shadow-md"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="uppercase tracking-wide">{currentLocale.toUpperCase().replace('-', '-')}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-[60] mt-2 w-[280px] rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
          <div className="grid grid-cols-2 gap-1">
            {options.map((option) => {
              const isActive = currentLocale === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`rounded-xl px-3 py-2 text-left text-sm transition ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
