'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Headphones, Pause, Play } from 'lucide-react';
import { RADIO_STATE_EVENT, RADIO_TOGGLE_EVENT } from '@/lib/radio-events';
import { getLocaleFromPathname } from '@/lib/i18n';

const BAR_HEIGHTS = [10, 16, 22, 28, 22, 16, 10];
const COMPACT_BAR_HEIGHTS = [8, 12, 16, 20, 16, 12, 8];

export default function RadioOnAirWidget({
  name,
  onlineLabel,
  compact = false,
  isPlaying: isPlayingProp,
  onToggle,
}: {
  name?: string;
  onlineLabel?: string;
  compact?: boolean;
  isPlaying?: boolean;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname || '/fr');
  const resolvedLabel = onlineLabel ?? (locale === 'fr' ? 'en ligne' : 'on air');
  const [stationName, setStationName] = useState(name || 'Radio MalakInfo');
  const [internalPlaying, setInternalPlaying] = useState(false);
  const isPlaying = isPlayingProp ?? internalPlaying;
  const bars = compact ? COMPACT_BAR_HEIGHTS : BAR_HEIGHTS;

  useEffect(() => {
    if (name) {
      setStationName(name);
      return;
    }

    let mounted = true;
    fetch('/api/radio/active', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (mounted && data?.name) setStationName(data.name);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [name]);

  useEffect(() => {
    if (isPlayingProp !== undefined) return;

    const handleRadioState = (event: Event) => {
      const customEvent = event as CustomEvent<{ isPlaying?: boolean }>;
      setInternalPlaying(customEvent.detail?.isPlaying === true);
    };

    window.addEventListener(RADIO_STATE_EVENT, handleRadioState);
    return () => window.removeEventListener(RADIO_STATE_EVENT, handleRadioState);
  }, [isPlayingProp]);

  return (
    <button
      type="button"
      onClick={() => (onToggle ? onToggle() : window.dispatchEvent(new Event(RADIO_TOGGLE_EVENT)))}
      className={`group inline-flex max-w-full items-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] ${
        compact ? 'gap-1.5 py-1 pl-1 pr-1 sm:gap-2' : 'gap-2 py-1.5 pl-1.5 pr-1.5 sm:gap-3'
      }`}
      aria-label={isPlaying ? `Mettre ${stationName} en pause` : `Écouter ${stationName} ${resolvedLabel}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-full border-2 border-[#2f6fbf] bg-white text-[#2f6fbf] transition group-hover:bg-[#eef4fc] ${
          compact ? 'h-9 w-9' : 'h-11 w-11 sm:h-12 sm:w-12'
        }`}
      >
        {isPlaying ? (
          <Pause className={compact ? 'h-4 w-4 fill-current' : 'h-5 w-5 fill-current'} />
        ) : (
          <Play className={`ml-0.5 fill-current ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
        )}
      </span>

      <span className={`flex items-end gap-[3px] pb-0.5 ${compact ? 'h-5' : 'h-7'}`} aria-hidden="true">
        {bars.map((height, index) => (
          <span
            key={index}
            className="w-[3px] origin-bottom rounded-full bg-[#1f7a6a]"
            style={{
              height,
              animation: isPlaying ? `radioOnAirBar 0.85s ease-in-out ${index * 0.08}s infinite` : undefined,
            }}
          />
        ))}
      </span>

      <span
        className={`min-w-0 truncate px-1 font-semibold tracking-tight text-[#1b5c52] ${
          compact ? 'max-w-[9.5rem] text-sm sm:max-w-[14rem]' : 'text-[15px] sm:text-base'
        }`}
      >
        {stationName} {resolvedLabel}
      </span>

      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-[#1f7a6a] text-white ${
          compact ? 'h-9 w-9' : 'h-11 w-11 sm:h-12 sm:w-12'
        }`}
      >
        <Headphones className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      </span>

      <style>{`
        @keyframes radioOnAirBar {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </button>
  );
}
