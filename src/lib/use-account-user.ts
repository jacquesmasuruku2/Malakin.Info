'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function useAccountUser() {
  const { data: session, status } = useSession();
  const [localUser, setLocalUser] = useState<any>(null);
  const [localReady, setLocalReady] = useState(false);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem('user');
      setLocalUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {
      setLocalUser(null);
    } finally {
      setLocalReady(true);
    }
  }, []);

  const user = session?.user ?? localUser;
  const ready = status !== 'loading' && localReady;

  return { user, ready };
}
