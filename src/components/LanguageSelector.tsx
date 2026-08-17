'use client';

import { useEffect, useMemo, useState } from 'react';

export type ApplicationLocale = 'fr' | 'en' | 'es' | 'sw' | 'ln' | 'rw';

const LOCALE_OPTIONS: Array<{ value: ApplicationLocale; label: string }> = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'sw', label: 'Kiswahili' },
  { value: 'ln', label: 'Lingala' },
  { value: 'rw', label: 'Kinyarwanda' },
];

function normalizeLocale(value?: string | null): ApplicationLocale {
  const normalized = (value ?? 'fr').toLowerCase();

  if ((['fr', 'en', 'es', 'sw', 'ln', 'rw'] as const).includes(normalized as ApplicationLocale)) {
    return normalized as ApplicationLocale;
  }

  return 'fr';
}

function readStoredLocale(): ApplicationLocale {
  if (typeof window === 'undefined') {
    return 'fr';
  }

  return normalizeLocale(window.localStorage.getItem('app-locale'));
}

type LanguageSelectorProps = {
  value?: ApplicationLocale;
  onChange?: (nextLocale: ApplicationLocale) => void;
  className?: string;
};

export function LanguageSelector({
  value,
  onChange,
  className = '',
}: LanguageSelectorProps) {
  const [locale, setLocale] = useState<ApplicationLocale>(value ?? readStoredLocale());

  useEffect(() => {
    if (value) {
      setLocale(normalizeLocale(value));
    }
  }, [value]);

  const options = useMemo(() => LOCALE_OPTIONS, []);

  const handleChange = (nextLocale: string) => {
    const normalized = normalizeLocale(nextLocale);
    setLocale(normalized);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('app-locale', normalized);
      document.documentElement.lang = normalized;

      // On déclenche un événement global pour permettre à d'autres composants
      // de réagir au changement de langue sans dépendre d'un contexte.
      window.dispatchEvent(
        new CustomEvent('app-language-change', {
          detail: { locale: normalized },
        })
      );
    }

    onChange?.(normalized);
  };

  return (
    <label className={`block text-sm font-medium text-foreground ${className}`}>
      <span className="mb-2 block">Langue</span>
      <select
        aria-label="Sélectionner la langue"
        value={locale}
        onChange={(event) => handleChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSelector;
