'use client';

import { useEffect, useState } from 'react';
import {
  CONSENT_UPDATED_EVENT,
  getConsentSavedAt,
  NON_ESSENTIAL_NOTIFICATIONS_DELAY_MS,
} from '@/lib/consent';

export function useConsentNotificationDelay() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    const updateReadiness = () => {
      window.clearTimeout(timer);
      const savedAt = getConsentSavedAt();
      if (savedAt === null) {
        setReady(false);
        return;
      }

      const remaining = savedAt + NON_ESSENTIAL_NOTIFICATIONS_DELAY_MS - Date.now();
      if (remaining <= 0) {
        setReady(true);
        return;
      }

      setReady(false);
      timer = window.setTimeout(() => setReady(true), remaining);
    };

    updateReadiness();
    window.addEventListener(CONSENT_UPDATED_EVENT, updateReadiness);
    window.addEventListener('storage', updateReadiness);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CONSENT_UPDATED_EVENT, updateReadiness);
      window.removeEventListener('storage', updateReadiness);
    };
  }, []);

  return ready;
}
