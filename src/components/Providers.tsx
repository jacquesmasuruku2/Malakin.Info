'use client';

import { SessionProvider } from 'next-auth/react';
import { ServicesModalProvider } from '@/contexts/ServicesModalContext';
import CookieConsentModal from '@/components/CookieConsentModal';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ServicesModalProvider>
        {children}
        <CookieConsentModal />
      </ServicesModalProvider>
    </SessionProvider>
  );
}
