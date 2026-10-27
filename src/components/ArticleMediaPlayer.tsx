'use client';

import { Pause, Play } from 'lucide-react';
import { useRef, useState } from 'react';

interface ArticleMediaPlayerProps {
  kind: 'audio' | 'video';
  src: string;
  title: string;
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
  poster,
}: ArticleMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

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
          setHasError(false);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
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
        <p className="article-audio-source">MALAKINFO · AUDIO</p>
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
    </figure>
  );
}
