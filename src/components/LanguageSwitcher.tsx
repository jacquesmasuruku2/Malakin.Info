'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import {
  getLanguageOptions,
  getLocaleFromPathname,
  getLocalizedPath,
  normalizeLocale,
} from '@/lib/i18n';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function persistLocale(locale: string) {
  const normalized = normalizeLocale(locale);
  document.cookie = `app-locale=${normalized}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  window.localStorage.setItem('app-locale', normalized);
  document.documentElement.lang = normalized;
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const currentLocale = getLocaleFromPathname(pathname);
  const options = getLanguageOptions();

  useEffect(() => {
    persistLocale(currentLocale);
  }, [currentLocale]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const switchLanguage = (nextLocale: string) => {
    if (nextLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    persistLocale(nextLocale);
    const search = typeof window !== 'undefined' ? window.location.search : '';
    setIsOpen(false);
    router.push(`${getLocalizedPath(pathname, nextLocale)}${search}`);
  };

  return (
    <div ref={wrapperRef} className="relative z-50 flex-shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-1 py-1 text-[15px] font-medium leading-none text-[#111827] transition-colors hover:text-[#0b3b8b]"
        aria-label="Changer la langue"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{currentLocale}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 min-w-[200px] border border-[#e6e6e1] bg-white py-2 shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
        >
          {options.map((option) => {
            const isSelected = option.value === currentLocale;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => switchLanguage(option.value)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[15px] ${
                    isSelected
                      ? 'bg-[#f4f1ea] font-semibold text-[#0b3b8b]'
                      : 'text-[#111827] hover:bg-[#f7f7f5]'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <span aria-hidden="true" className="text-[#d4af37]">●</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
