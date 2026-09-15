'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, X } from 'lucide-react';
import {
  canNotifyFollowedCategory,
  fetchCategorySuggestion,
  getFollowedCategories,
  markFollowedCategoryNotified,
  showCategoryNotification,
  type SuggestedArticle,
} from '@/lib/followed-categories';

export default function FollowedCategoryNotifier() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';
  const [suggestion, setSuggestion] = useState<SuggestedArticle | null>(null);
  const [categoryTitle, setCategoryTitle] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!canNotifyFollowedCategory()) return;

      const followed = getFollowedCategories();
      if (followed.length === 0) return;

      const currentSlug = pathname.split('/').filter(Boolean).at(-1);
      const picked = followed[Math.floor(Math.random() * followed.length)];
      const article = await fetchCategorySuggestion(picked.id);

      if (cancelled || !article || article.slug === currentSlug) return;

      markFollowedCategoryNotified();
      setCategoryTitle(picked.title);
      setSuggestion(article);
      setVisible(true);
      showCategoryNotification(locale, picked.title, article);
    };

    const timer = window.setTimeout(run, 1800);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [locale, pathname]);

  if (!visible || !suggestion) return null;

  const isFrench = locale === 'fr';

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md sm:left-auto sm:right-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#e8e2d4] bg-white p-4 shadow-[0_16px_40px_rgba(8,28,61,0.16)]">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted"
          aria-label={isFrench ? 'Fermer' : 'Close'}
        >
          <X className="h-4 w-4" />
        </button>
        <p className="mb-2 inline-flex items-center gap-1.5 pr-6 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          <Bell className="h-3.5 w-3.5" />
          {isFrench ? `Depuis vos favoris · ${categoryTitle}` : `From your favorites · ${categoryTitle}`}
        </p>
        <a href={`/${locale}/${suggestion.slug}`} className="block pr-4" onClick={() => setVisible(false)}>
          <p className="font-semibold leading-snug text-foreground">{suggestion.title}</p>
          {suggestion.excerpt && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{suggestion.excerpt}</p>
          )}
          <span className="mt-3 inline-flex text-sm font-medium text-primary">
            {isFrench ? 'Lire cet article' : 'Read this article'}
          </span>
        </a>
      </div>
    </div>
  );
}
