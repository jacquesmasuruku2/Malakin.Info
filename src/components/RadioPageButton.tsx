'use client';

import { Pause, Play, Radio } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RADIO_STATE_EVENT, RADIO_TOGGLE_EVENT } from '@/components/RadioPlayer';

export default function RadioPageButton() {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleRadioState = (event: Event) => {
      const customEvent = event as CustomEvent<{ isPlaying?: boolean }>;
      setIsPlaying(customEvent.detail?.isPlaying === true);
    };

    window.addEventListener(RADIO_STATE_EVENT, handleRadioState);
    return () => window.removeEventListener(RADIO_STATE_EVENT, handleRadioState);
  }, []);

  const handleClick = () => {
    window.dispatchEvent(new Event(RADIO_TOGGLE_EVENT));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-3 bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#081c3d] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e2c34f] hover:shadow-md"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#081c3d] text-[#d4af37]">
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
      </span>
      <span className="inline-flex items-center gap-2">
        <Radio className="h-4 w-4" />
        {isPlaying ? 'Mettre la radio en pause' : 'Écouter la radio'}
      </span>
    </button>
  );
}