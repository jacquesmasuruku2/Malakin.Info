'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { getLocaleFromPathname, getMessages } from '@/lib/i18n';

export default function SearchBar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const t = getMessages(locale).nav;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/recherche?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-3xl mx-4">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <form onSubmit={handleSearch} className="p-4 border-b border-border">
            <div className="flex items-center gap-4">
              <Search className="w-6 h-6 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchBarPlaceholder}
                className="flex-1 text-lg outline-none text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd>
              <span>{t.pressEscToClose}</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs ml-4">Enter</kbd>
              <span>{t.pressEnterToSearch}</span>
            </div>
          </form>
          
          {query && (
            <div className="p-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">
                {t.searchBarPlaceholder} "{query}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
