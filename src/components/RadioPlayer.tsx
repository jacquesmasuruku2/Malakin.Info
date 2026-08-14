'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Radio, Loader2, WifiOff } from 'lucide-react';
import Hls from 'hls.js';

type RadioStation = {
  id: string;
  name: string;
  streamUrl: string;
  logoUrl?: string | null;
  description?: string | null;
  showLabel?: boolean;
  isActive: boolean;
};

const DEFAULT_STATION: RadioStation = {
  id: 'default-radio',
  name: 'BBC World Service',
  streamUrl: 'https://as-hls-ww.live.cf.md.bbci.co.uk/pool_07364996/live/ww/bbc_world_service_news_internet/bbc_world_service_news_internet.isml/bbc_world_service_news_internet-audio%3d48000.norewind.m3u8',
  logoUrl: '/images/logo.png',
  description: 'Flux radio BBC par défaut',
  showLabel: true,
  isActive: true,
};

export default function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [station, setStation] = useState<RadioStation>(DEFAULT_STATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchStation = async () => {
      try {
        const response = await fetch('/api/radio/active', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Unable to load radio station');
        }

        const data = await response.json();
        if (!mounted) return;

        if (data && data.streamUrl) {
          setStation(data);
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

    const url = station.streamUrl;
    const isHlsStream = /\.m3u8($|\?)/i.test(url);

    if (isHlsStream && Hls.isSupported()) {
      if (!hlsRef.current) {
        hlsRef.current = new Hls({
          autoStartLoad: true,
          startLevel: -1,
          enableWorker: true,
          lowLatencyMode: false,
        });
      }

      hlsRef.current.destroy();
      hlsRef.current = new Hls({
        autoStartLoad: true,
        startLevel: -1,
        enableWorker: true,
        lowLatencyMode: false,
      });
      hlsRef.current.attachMedia(audio);
      hlsRef.current.loadSource(url);
      return () => {
        hlsRef.current?.detachMedia();
        hlsRef.current?.destroy();
        hlsRef.current = null;
      };
    }

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    audio.src = url;
    audio.load();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [station.streamUrl]);

  useEffect(() => {
    const handleToggleRadio = async () => {
      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      try {
        setIsBuffering(true);
        await audioRef.current.play();
      } catch {
        setError('Lecture impossible. Vérifiez l’URL du flux ou le réseau.');
        setIsBuffering(false);
        setIsPlaying(false);
      }
    };

    window.addEventListener('malakinfo-radio-toggle', handleToggleRadio);

    return () => {
      window.removeEventListener('malakinfo-radio-toggle', handleToggleRadio);
    };
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
      setError(null);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setIsBuffering(false);
      setIsPlaying(false);
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

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      setIsBuffering(true);
      await audioRef.current.play();
    } catch {
      setError('Lecture impossible. Vérifiez l’URL du flux ou le réseau.');
      setIsBuffering(false);
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const volumeLabel = useMemo(() => {
    if (isMuted || volume === 0) return 'Muet';
    if (volume < 0.35) return 'Faible';
    if (volume < 0.7) return 'Moyen';
    return 'Fort';
  }, [isMuted, volume]);

  return (
    <>
      <audio
        ref={audioRef}
        src={station.streamUrl}
        preload="none"
        autoPlay={false}
        crossOrigin="anonymous"
      />

      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className={`mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 sm:px-5 ${station.showLabel === false ? 'justify-end' : ''}`}>
          {station.showLabel !== false && (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-slate-800">
                {station.logoUrl ? (
                  <img
                    src={station.logoUrl}
                    alt={station.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary">
                    <Radio className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{station.name}</div>
                <div className="truncate text-[11px] text-slate-300">
                  {station.description || 'Radio en direct'}
                </div>
              </div>
            </div>
          )}

          <div className={`flex items-center gap-2 sm:gap-3 ${station.showLabel === false ? 'ml-auto' : ''}`}>
            <button
              type="button"
              onClick={togglePlayback}
              disabled={!station.streamUrl || !isMounted}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isBuffering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-slate-200 transition hover:bg-slate-700"
              aria-label={isMuted ? 'Réactiver le son' : 'Couper le son'}
            >
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <div className="hidden items-center gap-2 sm:flex">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setVolume(next);
                  setIsMuted(next === 0);
                }}
                className="h-1.5 w-24 cursor-pointer accent-primary"
                aria-label="Volume"
              />
              <span className="min-w-[42px] text-[10px] uppercase tracking-wide text-slate-300">{volumeLabel}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="border-t border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-200 sm:text-sm">
            <div className="inline-flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
