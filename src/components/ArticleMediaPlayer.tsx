'use client';

import { Download, MoreVertical, Pause, Play, SkipBack, SkipForward, Volume2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ArticleMediaPlayerProps {
  kind: 'audio' | 'video';
  src: string;
  title: string;
  author?: string;
  poster?: string;
}

function formatTime(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds)) return '--:--';
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  const hours = Math.floor(minutes / 60);
  const displayMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}:${String(displayMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export default function ArticleMediaPlayer({
  kind,
  src,
  title,
  author = '',
  poster,
}: ArticleMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isDockVisible, setIsDockVisible] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const handleOtherAudio = (event: Event) => {
      const activeSrc = (event as CustomEvent<string>).detail;
      if (activeSrc === src) return;
      audioRef.current?.pause();
      setIsDockVisible(false);
      setIsOptionsOpen(false);
    };

    document.addEventListener('article-audio-start', handleOtherAudio);
    return () => document.removeEventListener('article-audio-start', handleOtherAudio);
  }, [src]);

  if (kind === 'video') {
    return (
      <figure className="article-media-player article-video-card">
        <figcaption className="article-video-heading">
          <span className="article-video-kind">Vidéo</span>
          <span className="article-video-title">{title}</span>
          <span className="article-video-duration">{formatTime(duration)}</span>
        </figcaption>
        <video
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={(event) => {
            const mediaDuration = event.currentTarget.duration;
            setDuration(Number.isFinite(mediaDuration) ? mediaDuration : null);
          }}
          onError={() => setHasError(true)}
          onCanPlay={() => setHasError(false)}
        >
          Votre navigateur ne peut pas lire cette vidéo.
        </video>
        {hasError && <p className="article-media-error">Impossible de lire cette vidéo.</p>}
      </figure>
    );
  }

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play().catch(() => {
        setIsPlaying(false);
        setHasError(true);
      });
    } else {
      audio.pause();
    }
  };

  const seekTo = (value: string) => {
    const audio = audioRef.current;
    const nextTime = Number(value);
    if (audio && Number.isFinite(nextTime)) {
      audio.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  };

  const skipBy = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration ?? audio.duration, Math.max(0, audio.currentTime + seconds));
    setCurrentTime(audio.currentTime);
  };

  const closeDock = () => {
    audioRef.current?.pause();
    setIsDockVisible(false);
    setIsOptionsOpen(false);
  };

  return (
    <figure className="article-media-player article-audio-card">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => {
          const mediaDuration = event.currentTarget.duration;
          setDuration(Number.isFinite(mediaDuration) ? mediaDuration : null);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => {
          setIsPlaying(true);
          setIsDockVisible(true);
          setHasError(false);
          document.dispatchEvent(new CustomEvent('article-audio-start', { detail: src }));
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(duration ?? 0);
        }}
        onError={() => setHasError(true)}
      />
      <button
        type="button"
        className="article-audio-play"
        onClick={togglePlayback}
        aria-label={isPlaying ? 'Mettre en pause' : `Lire ${title}`}
        title={isPlaying ? 'Mettre en pause' : 'Lire'}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
      <div className="article-audio-time">{formatTime(duration)}</div>
      <div className="article-audio-content">
        <p className="article-audio-title">{title}</p>
        <p className="article-audio-source">{author || 'MALAKINFO · AUDIO'}</p>
        <input
          className="article-audio-progress"
          type="range"
          min={0}
          max={duration ?? 0}
          step={0.1}
          value={duration ? Math.min(currentTime, duration) : 0}
          onChange={(event) => seekTo(event.target.value)}
          disabled={!duration || hasError}
          aria-label="Position dans l’audio"
        />
      </div>
      {hasError && <p className="article-media-error">Impossible de lire cet audio.</p>}
      {isDockVisible && (
        <div className="article-audio-dock" role="region" aria-label="Lecteur audio en cours">
          <div className="article-audio-dock-progress">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration ?? 0}
              step={0.1}
              value={duration ? Math.min(currentTime, duration) : 0}
              onChange={(event) => seekTo(event.target.value)}
              disabled={!duration || hasError}
              aria-label="Position de lecture"
            />
            <span>{formatTime(duration)}</span>
          </div>
          <div className="article-audio-dock-main">
            <div className="article-audio-dock-meta">
              <span className="article-audio-dock-title">{title}</span>
              <span className="article-audio-dock-author">{author || 'MALAKINFO · AUDIO'}</span>
            </div>
            <div className="article-audio-dock-controls">
              <button type="button" onClick={() => skipBy(-15)} aria-label="Reculer de 15 secondes" title="-15 secondes">
                <SkipBack size={18} />
              </button>
              <button
                type="button"
                className="article-audio-dock-toggle"
                onClick={togglePlayback}
                aria-label={isPlaying ? 'Mettre en pause' : 'Reprendre la lecture'}
                title={isPlaying ? 'Pause' : 'Lecture'}
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <button type="button" onClick={() => skipBy(15)} aria-label="Avancer de 15 secondes" title="+15 secondes">
                <SkipForward size={18} />
              </button>
              <div className="article-audio-dock-volume">
                <Volume2 size={18} aria-hidden="true" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(event) => {
                    const nextVolume = Number(event.target.value);
                    setVolume(nextVolume);
                    if (audioRef.current) audioRef.current.volume = nextVolume;
                  }}
                  aria-label="Volume"
                />
              </div>
              <div className="article-audio-dock-options-wrap">
                <button
                  type="button"
                  onClick={() => setIsOptionsOpen((open) => !open)}
                  aria-label="Options audio"
                  aria-expanded={isOptionsOpen}
                  title="Options audio"
                >
                  <MoreVertical size={19} />
                </button>
                {isOptionsOpen && (
                  <div className="article-audio-dock-options">
                    <label htmlFor="article-audio-speed">Vitesse</label>
                    <select
                      id="article-audio-speed"
                      value={playbackRate}
                      onChange={(event) => {
                        const nextRate = Number(event.target.value);
                        setPlaybackRate(nextRate);
                        if (audioRef.current) audioRef.current.playbackRate = nextRate;
                      }}
                    >
                      {[0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                        <option key={rate} value={rate}>{rate}x</option>
                      ))}
                    </select>
                    <a href={src} download aria-label="Télécharger l’audio">
                      <Download size={16} />
                      Télécharger
                    </a>
                  </div>
                )}
              </div>
              <button type="button" onClick={closeDock} aria-label="Fermer le lecteur audio" title="Fermer">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </figure>
  );
}
