'use client';

import dynamic from 'next/dynamic';
import { SessionProvider } from 'next-auth/react';
import { ServicesModalProvider } from '@/contexts/ServicesModalContext';
import ThemeProvider from '@/components/ThemeProvider';

const CookieConsentModal = dynamic(() => import('@/components/CookieConsentModal'), {
  ssr: false,
});
const PublicationNotifier = dynamic(() => import('@/components/PublicationNotifier'), {
  ssr: false,
});
const FollowedCategoryNotifier = dynamic(() => import('@/components/FollowedCategoryNotifier'), {
  ssr: false,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <ThemeProvider>
        <ServicesModalProvider>
          {children}
          <CookieConsentModal />
          <PublicationNotifier />
          <FollowedCategoryNotifier />
        </ServicesModalProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
