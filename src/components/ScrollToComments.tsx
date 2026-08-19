'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ScrollToComments() {
  const searchParams = useSearchParams();
  const scrollToComments = searchParams.get('scroll_to_comments') === 'true';

  useEffect(() => {
    if (scrollToComments) {
      // Find the comments section and scroll to it
      const commentsSection = document.querySelector('[data-comments-section]');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [scrollToComments]);

  return null;
}
