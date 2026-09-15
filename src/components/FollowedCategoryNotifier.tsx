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
import { copies, pickCopy } from '@/lib/copy';

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

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-4 right-4 z-[70] mx-auto max-w-sm sm:bottom-6 sm:left-auto sm:right-5"
    >
      <article className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <div className="flex items-start gap-3 px-4 pb-2 pt-3">
          {suggestion.mainImageUrl ? (
            <img
              src={suggestion.mainImageUrl}
              alt=""
              className="mt-0.5 h-11 w-11 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <Bell className="h-5 w-5" aria-hidden />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              MalakInfo · {categoryTitle}
            </p>
            <p className="mt-0.5 text-xs font-medium text-foreground/75">
              {pickCopy(locale, copies.fromFavorites)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="shrink-0 rounded-full p-1.5 text-foreground/70 hover:bg-muted hover:text-foreground"
            aria-label={pickCopy(locale, copies.close)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <a
          href={`/${locale}/${suggestion.slug}`}
          className="block px-4 pb-4"
          onClick={() => setVisible(false)}
        >
          <p className="text-[15px] font-bold leading-snug text-foreground">{suggestion.title}</p>
          {suggestion.excerpt && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-foreground/80">
              {suggestion.excerpt}
            </p>
          )}
          <span className="mt-3 inline-flex rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground">
            {pickCopy(locale, copies.readThisArticle)}
          </span>
        </a>
      </article>
    </div>
  );
}
