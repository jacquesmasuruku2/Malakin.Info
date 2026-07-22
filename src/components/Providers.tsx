'use client';

import { SessionProvider } from 'next-auth/react';
import { ServicesModalProvider } from '@/contexts/ServicesModalContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ServicesModalProvider>
        {children}
      </ServicesModalProvider>
    </SessionProvider>
  );
}
