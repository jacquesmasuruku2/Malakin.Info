'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    const existingRedirect = localStorage.getItem('redirect-after-login');
    if (!existingRedirect || existingRedirect === '/login' || existingRedirect === '/') {
      localStorage.setItem('redirect-after-login', pathname);
    }

    router.replace('/login');
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}
