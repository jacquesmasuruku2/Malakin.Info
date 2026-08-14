'use client';

import { useEffect } from 'react';

interface ViewIncrementerProps {
  articleId: string;
}

const STORAGE_PREFIX = 'malakinfo_article_viewed';

export default function ViewIncrementer({ articleId }: ViewIncrementerProps) {
  useEffect(() => {
    if (!articleId) return;

    const incrementViews = async () => {
      const storageKey = `${STORAGE_PREFIX}:${articleId}`;
      const now = Date.now();
      const cooldownMs = 10 * 60 * 1000;

      try {
        const cached = window.localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached) as { expiresAt?: number };
          if (parsed.expiresAt && parsed.expiresAt > now) {
            return;
          }
        }

        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ expiresAt: now + cooldownMs }),
        );

        await fetch(`/api/articles/${articleId}/increment-views`, {
          method: 'POST',
        });
      } catch (error) {
        window.localStorage.removeItem(storageKey);
        console.error('Failed to increment views:', error);
      }
    };

    incrementViews();
  }, [articleId]);

  return null;
}
