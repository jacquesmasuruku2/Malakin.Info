'use client';

import { useEffect } from 'react';

interface ViewIncrementerProps {
  articleId: string;
}

export default function ViewIncrementer({ articleId }: ViewIncrementerProps) {
  useEffect(() => {
    // Increment views when component mounts
    const incrementViews = async () => {
      try {
        await fetch(`/api/articles/${articleId}/increment-views`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Failed to increment views:', error);
      }
    };

    incrementViews();
  }, [articleId]);

  return null; // This component doesn't render anything
}
