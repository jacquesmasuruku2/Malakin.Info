'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { USER_UPDATED_EVENT } from '@/lib/theme';

export function useAccountUser() {
  const { data: session, status } = useSession();
  const [localUser, setLocalUser] = useState<any>(null);
  const [localReady, setLocalReady] = useState(false);

  useEffect(() => {
    const readUser = () => {
      try {
        const storedUser = window.localStorage.getItem('user');
        setLocalUser(storedUser ? JSON.parse(storedUser) : null);
      } catch {
        setLocalUser(null);
      } finally {
        setLocalReady(true);
      }
    };

    readUser();
    window.addEventListener(USER_UPDATED_EVENT, readUser);
    window.addEventListener('storage', readUser);
    return () => {
      window.removeEventListener(USER_UPDATED_EVENT, readUser);
      window.removeEventListener('storage', readUser);
    };
  }, []);

  const sessionUser = session?.user;
  const user = useMemo(() => {
    if (!sessionUser && !localUser) return null;
    return { ...(sessionUser || {}), ...(localUser || {}) };
  }, [sessionUser, localUser]);
  const ready = status !== 'loading' && localReady;

  return { user, ready };
}
