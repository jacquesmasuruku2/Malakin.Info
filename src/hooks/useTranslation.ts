'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type TranslationLocale = 'fr' | 'en' | 'es' | 'sw' | 'ln' | 'rw';

type TranslationPayload = {
  text: string;
  sourceLang?: TranslationLocale;
  targetLang: TranslationLocale;
};

type TranslationResponse = {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
};

const CACHE_KEY = 'libretranslate-cache-v1';
const inMemoryCache = new Map<string, string>();

function safeReadCache(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, string>) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Le stockage local peut être indisponible; on ne casse pas l'app.
  }
}

function makeCacheKey(text: string, sourceLang: string, targetLang: string) {
  return `${sourceLang}:${targetLang}:${text.trim()}`;
}

function normalizeTargetLanguage(locale?: string): TranslationLocale {
  const normalized = (locale ?? 'fr').toLowerCase();

  if (normalized === 'ln' || normalized === 'rw') {
    return 'fr';
  }

  if (normalized === 'fr' || normalized === 'en' || normalized === 'es' || normalized === 'sw') {
    return normalized as TranslationLocale;
  }

  return 'fr';
}

function normalizeSourceLanguage(locale?: string): TranslationLocale {
  const normalized = (locale ?? 'fr').toLowerCase();

  if (normalized === 'ln' || normalized === 'rw') {
    return 'fr';
  }

  if (normalized === 'fr' || normalized === 'en' || normalized === 'es' || normalized === 'sw') {
    return normalized as TranslationLocale;
  }

  return 'fr';
}

export function useTranslation() {
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestRequestId = useRef(0);

  const translate = useCallback(
    async (text: string, targetLang: string, sourceLang: string = 'fr') => {
      const cleanText = text.trim();

      if (!cleanText) {
        setTranslatedText('');
        setError(null);
        return '';
      }

      const normalizedSourceLang = normalizeSourceLanguage(sourceLang);
      const normalizedTargetLang = normalizeTargetLanguage(targetLang);
      const cacheKey = makeCacheKey(cleanText, normalizedSourceLang, normalizedTargetLang);

      const memoryCached = inMemoryCache.get(cacheKey);
      if (memoryCached) {
        setTranslatedText(memoryCached);
        setError(null);
        return memoryCached;
      }

      const storageCache = safeReadCache();
      const localCached = storageCache[cacheKey];
      if (localCached) {
        inMemoryCache.set(cacheKey, localCached);
        setTranslatedText(localCached);
        setError(null);
        return localCached;
      }

      const requestId = ++latestRequestId.current;
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: cleanText,
            sourceLang: normalizedSourceLang,
            targetLang: normalizedTargetLang,
          } satisfies TranslationPayload),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string; details?: string }
            | null;
          throw new Error(payload?.details || payload?.error || 'Erreur inconnue lors de la traduction.');
        }

        const payload = (await response.json()) as TranslationResponse;

        if (!payload.translatedText) {
          throw new Error('Aucune traduction reçue du serveur.');
        }

        if (requestId === latestRequestId.current) {
          setTranslatedText(payload.translatedText);
          setError(null);
        }

        const nextCache = safeReadCache();
        nextCache[cacheKey] = payload.translatedText;
        inMemoryCache.set(cacheKey, payload.translatedText);
        writeCache(nextCache);

        return payload.translatedText;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue lors de la traduction.';
        if (requestId === latestRequestId.current) {
          setError(message);
          setTranslatedText('');
        }
        return '';
      } finally {
        if (requestId === latestRequestId.current) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      latestRequestId.current += 1;
    };
  }, []);

  return {
    translatedText,
    isLoading,
    error,
    translate,
  };
}
