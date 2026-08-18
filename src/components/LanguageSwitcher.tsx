'use client';

import { useEffect, useRef, useState } from 'react';
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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = pathname.split('/')[1] || 'fr';
  const currentOption = LOCALE_OPTIONS.find((option) => option.value === currentLocale) ?? LOCALE_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  const switchLanguage = (nextLocale: string) => {
    const pathParts = pathname.split('/');
    if (pathParts[1]) {
      pathParts[1] = nextLocale;
    } else {
      pathParts.unshift(nextLocale);
    }

    const newPath = pathParts.join('/');
    setIsOpen(false);
    router.push(newPath || `/${nextLocale}`);
  };

  return (
    <div ref={wrapperRef} className="relative z-50">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-[#dfe4ea] bg-[#0b3b8b] px-3 py-2 text-white shadow-[0_8px_24px_rgba(11,59,139,0.18)] transition-all duration-200 hover:brightness-105 sm:px-4"
        aria-label="Changer la langue"
      >
        <Languages className="h-4 w-4 text-white" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90">Langue</span>
        <span className="rounded-full bg-white/12 px-2 py-1 text-sm font-semibold text-white shadow-inner">
          {currentOption.label}
        </span>
        <ChevronDown className={`h-4 w-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[210px] overflow-hidden rounded-2xl border border-[#dfe4ea] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
          {LOCALE_OPTIONS.map((option) => {
            const isSelected = option.value === currentLocale;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => switchLanguage(option.value)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors ${
                  isSelected ? 'bg-[#edf4ff] text-[#0b3b8b]' : 'text-[#1f2937] hover:bg-[#f7f9fc]'
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <span className="text-xs font-bold text-[#0b3b8b]">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
