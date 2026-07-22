'use client';

import { SessionProvider } from 'next-auth/react';
import { ServicesModalProvider } from '@/contexts/ServicesModalContext';
import { HamburgerMenuProvider } from '@/contexts/HamburgerMenuContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ServicesModalProvider>
        <HamburgerMenuProvider>
          {children}
        </HamburgerMenuProvider>
      </ServicesModalProvider>
    </SessionProvider>
  );
}
