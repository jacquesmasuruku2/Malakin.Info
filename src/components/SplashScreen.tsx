'use client';

import { useEffect, useState } from 'react';

const VISIBLE_MS = 2000;
const FADE_MS = 400;
const STORAGE_KEY = 'malakinfo-preload-seen';

export default function SplashScreen() {
  const [phase, setPhase] = useState<'show' | 'hide' | 'gone'>('show');

  useEffect(() => {
    if (window.sessionStorage.getItem(STORAGE_KEY) === '1') {
      setPhase('gone');
      return;
    }

    const fadeTimer = window.setTimeout(() => setPhase('hide'), VISIBLE_MS);
    const goneTimer = window.setTimeout(() => {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
      setPhase('gone');
    }, VISIBLE_MS + FADE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(goneTimer);
    };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background/20 transition-opacity ease-out pointer-events-none ${
        phase === 'hide' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      aria-hidden="true"
    >
      <img
        src="/images/logo.png"
        alt=""
        className="h-16 w-auto max-w-[200px] object-contain drop-shadow-md sm:h-20 md:h-24"
        loading="eager"
      />
    </div>
  );
}
