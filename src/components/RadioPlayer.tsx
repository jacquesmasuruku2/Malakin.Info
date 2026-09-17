'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WifiOff } from 'lucide-react';
import type Hls from 'hls.js';
import RadioOnAirWidget from '@/components/RadioOnAirWidget';
import { RADIO_STATE_EVENT, RADIO_TOGGLE_EVENT, broadcastRadioPlaying } from '@/lib/radio-events';

export { RADIO_STATE_EVENT, RADIO_TOGGLE_EVENT };

type RadioStation = {
  id: string;
  name: string;
  streamUrl: string;
  logoUrl?: string | null;
  description?: string | null;
  showLabel?: boolean;
  isActive: boolean;
};

const RADIO_STORAGE_KEY = 'malakinfo-radio-state';
const RADIO_CACHE_KEY = 'malakinfo-radio-active-cache';
const RADIO_CACHE_TTL_MS = 60_000;

const saveRadioState = (state: { isPlaying: boolean; volume: number; isMuted: boolean; station: RadioStation }) => {
  try {
    localStorage.setItem(RADIO_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save radio state:', error);
  }
};

const loadRadioState = () => {
  try {
    const saved = localStorage.getItem(RADIO_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load radio state:', error);
  }
  return null;
};

export default function RadioPlayer() {
  const pathname = usePathname();
  const isMediaPage = Boolean(pathname?.includes('/medias') || pathname?.includes('/diffusion-en-direct'));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [station, setStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const lastScrollYRef = useRef(0);
  const wantsPlaybackRef = useRef(false);

  useEffect(() => {
    const savedState = loadRadioState();
    if (savedState) {
      setVolume(typeof savedState.volume === 'number' ? savedState.volume : 0.7);
      setIsMuted(Boolean(savedState.isMuted));
    }
  }, []);

  useEffect(() => {
    if (!station?.streamUrl) return;
    saveRadioState({ isPlaying, volume, isMuted, station });
  }, [isPlaying, volume, isMuted, station]);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 12) {
        setIsHidden(false);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      const scrollDelta = currentScrollY - lastScrollYRef.current;

      if (scrollDelta < -12) {
        setIsHidden(true);
      } else if (scrollDelta > 12) {
        setIsHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchStation = async () => {
      try {
        try {
          const cachedRaw = sessionStorage.getItem(RADIO_CACHE_KEY);
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw) as { at: number; data: RadioStation | null };
            if (Date.now() - cached.at < RADIO_CACHE_TTL_MS) {
              if (!mounted) return;
              setStation(cached.data);
              return;
            }
          }
        } catch {
          // ignore cache read errors
        }

        const response = await fetch('/api/radio/active');
        if (!response.ok) {
          throw new Error('Unable to load radio station');
        }

        const data = await response.json();
        if (!mounted) return;

        const nextStation = data && data.streamUrl ? data : null;
        setStation(nextStation);
        try {
          sessionStorage.setItem(
            RADIO_CACHE_KEY,
            JSON.stringify({ at: Date.now(), data: nextStation }),
          );
        } catch {
          // ignore cache write errors
        }
      } catch {
        if (!mounted) return;
        setError('Le flux radio est indisponible pour le moment.');
      }
    };

    fetchStation();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const url = station?.streamUrl;
    if (!url) return;
    let cancelled = false;

    const setup = async () => {
      const isHlsStream = /\.m3u8($|\?)/i.test(url) || /\.m3u8/i.test(decodeURIComponent(url));

      if (isHlsStream) {
        const HlsModule = (await import('hls.js')).default;
        if (cancelled) return;

        if (HlsModule.isSupported()) {
          hlsRef.current?.destroy();
          hlsRef.current = new HlsModule({
            autoStartLoad: false,
            startLevel: -1,
            enableWorker: true,
            lowLatencyMode: false,
          });
          hlsRef.current.attachMedia(audio);
          hlsRef.current.loadSource(url);
          hlsRef.current.on(HlsModule.Events.MANIFEST_PARSED, () => {
            if (wantsPlaybackRef.current && audioRef.current) {
              void audioRef.current.play().catch(() => {
                wantsPlaybackRef.current = false;
                setError('Lecture impossible. Vérifiez l’URL du flux ou le réseau.');
                setIsBuffering(false);
                setIsPlaying(false);
                broadcastRadioPlaying(false);
              });
            }
          });
          hlsRef.current.on(HlsModule.Events.ERROR, (_event, data) => {
            if (!data.fatal) return;
            wantsPlaybackRef.current = false;
            setError('Le flux audio est indisponible ou invalide.');
            setIsBuffering(false);
            setIsPlaying(false);
            broadcastRadioPlaying(false);
          });
          return;
        }
      }

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      audio.src = url;
      audio.load();
    };

    void setup();

    return () => {
      cancelled = true;
      if (hlsRef.current) {
        hlsRef.current.detachMedia?.();
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [station?.streamUrl]);

  useEffect(() => {
    const handleToggleRadio = async () => {
      if (!audioRef.current) return;
      setIsDesktopOpen(true);

      if (wantsPlaybackRef.current) {
        wantsPlaybackRef.current = false;
        audioRef.current.pause();
        hlsRef.current?.stopLoad();
        setIsPlaying(false);
        setIsBuffering(false);
        broadcastRadioPlaying(false);
        return;
      }

      try {
        wantsPlaybackRef.current = true;
        setIsPlaying(true);
        setIsBuffering(true);
        broadcastRadioPlaying(true);
        hlsRef.current?.startLoad();
        await audioRef.current.play();
      } catch {
        // HLS may still start after MANIFEST_PARSED.
      }
    };

    window.addEventListener(RADIO_TOGGLE_EVENT, handleToggleRadio);
    window.addEventListener('malakinfo-radio-toggle', handleToggleRadio);

    return () => {
      window.removeEventListener(RADIO_TOGGLE_EVENT, handleToggleRadio);
      window.removeEventListener('malakinfo-radio-toggle', handleToggleRadio);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleWaiting = () => {
      if (wantsPlaybackRef.current) setIsBuffering(true);
    };
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
      wantsPlaybackRef.current = true;
      broadcastRadioPlaying(true);
      setError(null);
    };
    const handlePause = () => {
      if (wantsPlaybackRef.current) return;
      setIsPlaying(false);
      setIsBuffering(false);
      broadcastRadioPlaying(false);
    };
    const handleError = () => {
      wantsPlaybackRef.current = false;
      setIsBuffering(false);
      setIsPlaying(false);
      broadcastRadioPlaying(false);
      setError('Le flux audio est indisponible ou invalide.');
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Media Session API for system controls (notification center, lock screen)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !audioRef.current) return;

    const audio = audioRef.current;

    // Set metadata
    if (!station) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: station.name,
      artist: station.description || 'Radio en direct',
      album: 'MalakInfo',
      artwork: station.logoUrl ? [
        { src: station.logoUrl, sizes: '96x96', type: 'image/png' },
        { src: station.logoUrl, sizes: '128x128', type: 'image/png' },
        { src: station.logoUrl, sizes: '192x192', type: 'image/png' },
        { src: station.logoUrl, sizes: '256x256', type: 'image/png' },
        { src: station.logoUrl, sizes: '384x384', type: 'image/png' },
        { src: station.logoUrl, sizes: '512x512', type: 'image/png' },
      ] : [],
    });

    // Set action handlers
    const handlePlay = async () => {
      wantsPlaybackRef.current = true;
      setIsPlaying(true);
      broadcastRadioPlaying(true);
      await audio.play();
    };

    const handlePause = () => {
      wantsPlaybackRef.current = false;
      audio.pause();
      setIsPlaying(false);
      broadcastRadioPlaying(false);
    };

    const handleStop = () => {
      wantsPlaybackRef.current = false;
      audio.pause();
      setIsPlaying(false);
      broadcastRadioPlaying(false);
    };

    navigator.mediaSession.setActionHandler('play', handlePlay);
    navigator.mediaSession.setActionHandler('pause', handlePause);
    navigator.mediaSession.setActionHandler('stop', handleStop);

    // Update playback state
    if (isPlaying) {
      navigator.mediaSession.playbackState = 'playing';
    } else {
      navigator.mediaSession.playbackState = 'paused';
    }

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('stop', null);
    };
  }, [station, isPlaying]);

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    try {
      if (wantsPlaybackRef.current) {
        wantsPlaybackRef.current = false;
        audioRef.current.pause();
        hlsRef.current?.stopLoad();
        setIsPlaying(false);
        setIsBuffering(false);
        broadcastRadioPlaying(false);
        return;
      }

      wantsPlaybackRef.current = true;
      setIsPlaying(true);
      setIsBuffering(true);
      broadcastRadioPlaying(true);
      hlsRef.current?.startLoad();
      await audioRef.current.play();
    } catch {
      setError('Lecture impossible. Vérifiez l’URL du flux ou le réseau.');
      wantsPlaybackRef.current = false;
      setIsBuffering(false);
      setIsPlaying(false);
      broadcastRadioPlaying(false);
    }
  };

  useEffect(() => {
    broadcastRadioPlaying(isPlaying);
  }, [isPlaying]);

  if (!station?.streamUrl) {
    return null;
  }

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        autoPlay={false}
        crossOrigin="anonymous"
      />

      <div
        className={`${isMobile || isMediaPage || isDesktopOpen ? 'fixed' : 'hidden'} z-[60] transition-transform duration-300 ease-out ${
          isMobile
            ? 'inset-x-0 bottom-0 flex justify-center px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))]'
            : 'right-[max(0.75rem,calc((100vw-80rem)/2+1rem))] top-[5.5rem] w-[min(360px,calc(100vw-1.5rem))]'
        } ${!isMobile && isHidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'}`}
      >
        <div className="flex w-full max-w-md flex-col items-center">
          <RadioOnAirWidget
            compact={isMobile}
            name={station.name}
            isPlaying={isPlaying}
            onToggle={() => {
              void togglePlayback();
            }}
          />
          {error && (
            <div className="mt-2 w-full rounded-full bg-red-600/95 px-3 py-1.5 text-center text-xs text-white sm:text-sm">
              <div className="inline-flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
