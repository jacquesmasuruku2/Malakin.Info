'use client';

import { useEffect } from 'react';

export default function BlogViewIncrementer({ blogPostId }: { blogPostId: string }) {
  useEffect(() => {
    const key = `malakinfo_blog_viewed:${blogPostId}`;
    const now = Date.now();
    try {
      const cached = window.localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached) as { expiresAt?: number };
        if (parsed.expiresAt && parsed.expiresAt > now) return;
      }
      window.localStorage.setItem(key, JSON.stringify({ expiresAt: now + 10 * 60 * 1000 }));
      fetch(`/api/blog-posts/${blogPostId}/increment-views`, { method: 'POST' }).catch((error) => {
        window.localStorage.removeItem(key);
        console.error('Failed to increment blog views:', error);
      });
    } catch (error) {
      console.error('Failed to update blog view tracking:', error);
    }
  }, [blogPostId]);

  return null;
}
