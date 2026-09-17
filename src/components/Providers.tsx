'use client';

import { SessionProvider } from 'next-auth/react';
import { ServicesModalProvider } from '@/contexts/ServicesModalContext';
import CookieConsentModal from '@/components/CookieConsentModal';
import FollowedCategoryNotifier from '@/components/FollowedCategoryNotifier';
import PublicationNotifier from '@/components/PublicationNotifier';
import ThemeProvider from '@/components/ThemeProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
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
