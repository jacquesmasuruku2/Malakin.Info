'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Languages } from 'lucide-react';

const LOCALE_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'sw', label: 'Kiswahili' },
  { value: 'ln', label: 'Lingala' },
  { value: 'rw', label: 'Kinyarwanda' },
] as const;

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname.split('/')[1] || 'fr';
  const currentLabel = LOCALE_OPTIONS.find((option) => option.value === currentLocale)?.label ?? 'Français';

  const switchLanguage = (nextLocale: string) => {
    const pathParts = pathname.split('/');
    if (pathParts[1]) {
      pathParts[1] = nextLocale;
    } else {
      pathParts.unshift(nextLocale);
    }

    const newPath = pathParts.join('/');
    router.push(newPath || `/${nextLocale}`);
  };

  return (
    <div className="relative flex items-center">
      <label className="flex items-center gap-2 rounded-full border border-[#dfe4ea] bg-white/95 px-3 py-2 shadow-[0_8px_22px_rgba(11,59,139,0.08)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_10px_28px_rgba(11,59,139,0.12)] sm:px-4">
        <Languages className="h-4 w-4 text-[#0b3b8b]" />
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[#22314f] sm:inline">
          Langue
        </span>
        <select
          aria-label="Sélectionner la langue"
          value={currentLocale}
          onChange={(event) => switchLanguage(event.target.value)}
          className="appearance-none bg-transparent pr-5 text-sm font-medium text-[#0b3b8b] outline-none"
        >
          {LOCALE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-[#0b3b8b]" />
      </label>
    </div>
  );
}
