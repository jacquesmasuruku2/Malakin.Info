'use client';

import { Headphones, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RADIO_STATE_EVENT, RADIO_TOGGLE_EVENT } from '@/components/RadioPlayer';

export default function RadioHomeButton() {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleRadioState = (event: Event) => {
      const customEvent = event as CustomEvent<{ isPlaying?: boolean }>;
      setIsPlaying(customEvent.detail?.isPlaying === true);
    };

    window.addEventListener(RADIO_STATE_EVENT, handleRadioState);
    return () => window.removeEventListener(RADIO_STATE_EVENT, handleRadioState);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(RADIO_TOGGLE_EVENT))}
      className="group hidden items-center gap-3 border border-[#d4af37]/50 bg-[#081c3d] px-3 py-2 text-left text-white shadow-lg transition hover:-translate-y-0.5 hover:border-[#d4af37] hover:bg-[#102b54] md:inline-flex"
      aria-label={isPlaying ? 'Mettre la radio en pause' : 'Écouter la radio'}
      title={isPlaying ? 'Mettre la radio en pause' : 'Écouter la radio'}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4af37] text-[#081c3d] transition-transform group-hover:scale-105">
        {isPlaying ? <Pause className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
      </span>
      <span className="pr-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#d4af37]">Radio</span>
        <span className="block text-xs font-semibold">{isPlaying ? 'En écoute' : 'Écouter en direct'}</span>
      </span>
      {!isPlaying && <Play className="h-3.5 w-3.5 text-[#d4af37]" />}
    </button>
  );
}
