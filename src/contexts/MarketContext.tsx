'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  DEFAULT_MARKET_CURRENCY,
  isMarketCurrencyCode,
  isMarketSnapshot,
  MARKET_ASSETS,
  type MarketCurrencyCode,
  type MarketAssetId,
  type MarketSnapshot,
} from '@/lib/market-config';

const MARKET_CURRENCY_STORAGE_KEY = 'malakinfo-market-currency';
const MARKET_REFRESH_INTERVAL_MS = 15_000;
const MARKET_CURRENCY_CHANGE_EVENT = 'malakinfo-market-currency-change';
const BINANCE_STREAM_BASE_URL = 'wss://stream.binance.com:9443/stream?streams=';
const BINANCE_RECONNECT_MAX_MS = 30_000;

export type LiveCryptoQuote = {
  priceUsdt: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24hUsdt: number;
  sourceUpdatedAt: string;
  direction: 'up' | 'down' | 'unchanged';
};

type BinanceTickerEvent = {
  e: string;
  E: number;
  s: string;
  c: string;
  P: string;
  h: string;
  l: string;
  q: string;
};

type MarketFeedStatus = 'connecting' | 'live' | 'fallback';

const BINANCE_SYMBOL_TO_ASSET = new Map(
  MARKET_ASSETS.filter((asset) => asset.type === 'crypto').map((asset) => [
    `${asset.symbol}USDT`,
    asset.id,
  ]),
);

const BINANCE_STREAMS = [
  ...MARKET_ASSETS.filter((asset) => asset.type === 'crypto').map(
    (asset) => `${asset.symbol.toLowerCase()}usdt@ticker`,
  ),
  'usdcusdt@ticker',
].join('/');

function getStoredCurrency(): MarketCurrencyCode {
  const savedCurrency = window.localStorage.getItem(MARKET_CURRENCY_STORAGE_KEY);
  return isMarketCurrencyCode(savedCurrency) ? savedCurrency : DEFAULT_MARKET_CURRENCY;
}

function subscribeToCurrencyChange(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(MARKET_CURRENCY_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(MARKET_CURRENCY_CHANGE_EVENT, onChange);
  };
}

type MarketContextValue = {
  currency: MarketCurrencyCode;
  setCurrency: (currency: MarketCurrencyCode) => void;
  snapshot: MarketSnapshot | null;
  liveQuotes: Partial<Record<MarketAssetId, LiveCryptoQuote>>;
  usdtUsdRate: number;
  feedStatus: MarketFeedStatus;
  loading: boolean;
  error: boolean;
};

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const currency = useSyncExternalStore(
    subscribeToCurrencyChange,
    getStoredCurrency,
    () => DEFAULT_MARKET_CURRENCY,
  );
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [liveQuotes, setLiveQuotes] = useState<Partial<Record<MarketAssetId, LiveCryptoQuote>>>({});
  const [usdtUsdRate, setUsdtUsdRate] = useState(1);
  const [feedStatus, setFeedStatus] = useState<MarketFeedStatus>('connecting');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const loadingRef = useRef(false);
  const liveQuotesRef = useRef<Partial<Record<MarketAssetId, LiveCryptoQuote>>>({});

  const setCurrency = useCallback((nextCurrency: MarketCurrencyCode) => {
    window.localStorage.setItem(MARKET_CURRENCY_STORAGE_KEY, nextCurrency);
    window.dispatchEvent(new Event(MARKET_CURRENCY_CHANGE_EVENT));
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const updateQuotes = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        const response = await fetch('/api/markets', { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Market data request failed with HTTP ${response.status}.`);
        }

        const data: unknown = await response.json();
        if (!isMarketSnapshot(data)) throw new Error('Market data response was invalid.');
        if (active) {
          setSnapshot(data);
          setError(false);
        }
      } catch {
        if (active && !controller.signal.aborted) setError(true);
      } finally {
        loadingRef.current = false;
        if (active) setLoading(false);
      }
    };

    void updateQuotes();
    const intervalId = window.setInterval(
      () => void updateQuotes(),
      MARKET_REFRESH_INTERVAL_MS,
    );

    return () => {
      active = false;
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let active = true;
    let reconnectTimeout: number | undefined;
    let staleTimeout: number | undefined;
    let reconnectDelay = 1_000;
    let socket: WebSocket | undefined;

    const connect = () => {
      if (!active) return;
      setFeedStatus('connecting');
      socket = new WebSocket(`${BINANCE_STREAM_BASE_URL}${BINANCE_STREAMS}`);

      const markFeedLive = () => {
        if (!active) return;
        setFeedStatus('live');
        if (staleTimeout !== undefined) window.clearTimeout(staleTimeout);
        staleTimeout = window.setTimeout(() => {
          if (active) setFeedStatus('fallback');
        }, 10_000);
      };

      socket.onopen = () => {
        reconnectDelay = 1_000;
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        try {
          const message: unknown = JSON.parse(event.data);
          if (!isBinanceTickerMessage(message)) return;
          markFeedLive();
          if (message.data.s === 'USDCUSDT') {
            const usdtUsdRate = 1 / Number(message.data.c);
            if (Number.isFinite(usdtUsdRate) && usdtUsdRate > 0) {
              setUsdtUsdRate(usdtUsdRate);
            }
            return;
          }

          const assetId = BINANCE_SYMBOL_TO_ASSET.get(message.data.s);
          if (!assetId) return;

          const priceUsdt = Number(message.data.c);
          const change24h = Number(message.data.P);
          const high24h = Number(message.data.h);
          const low24h = Number(message.data.l);
          const volume24hUsdt = Number(message.data.q);
          if (
            ![priceUsdt, change24h, high24h, low24h, volume24hUsdt].every(Number.isFinite) ||
            priceUsdt <= 0
          ) {
            return;
          }

          const previousPrice = liveQuotesRef.current[assetId]?.priceUsdt;
          const quote: LiveCryptoQuote = {
            priceUsdt,
            change24h,
            high24h,
            low24h,
            volume24hUsdt,
            sourceUpdatedAt: new Date(message.data.E).toISOString(),
            direction:
              previousPrice === undefined || previousPrice === priceUsdt
                ? 'unchanged'
                : priceUsdt > previousPrice
                  ? 'up'
                  : 'down',
          };

          liveQuotesRef.current = { ...liveQuotesRef.current, [assetId]: quote };
          setLiveQuotes(liveQuotesRef.current);
        } catch (parseError) {
          console.error('Could not parse live Binance market data:', parseError);
        }
      };

      socket.onerror = () => {
        if (active) setFeedStatus('fallback');
        socket?.close();
      };

      socket.onclose = () => {
        if (!active) return;
        setFeedStatus('fallback');
        if (staleTimeout !== undefined) window.clearTimeout(staleTimeout);
        reconnectTimeout = window.setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, BINANCE_RECONNECT_MAX_MS);
      };

    };

    connect();

    return () => {
      active = false;
      if (reconnectTimeout !== undefined) window.clearTimeout(reconnectTimeout);
      if (staleTimeout !== undefined) window.clearTimeout(staleTimeout);
      socket?.close();
    };
  }, []);

  return (
    <MarketContext.Provider
      value={{
        currency,
        setCurrency,
        snapshot,
        liveQuotes,
        usdtUsdRate,
        feedStatus,
        loading,
        error,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}

function isBinanceTickerMessage(
  value: unknown,
): value is { stream: string; data: BinanceTickerEvent } {
  if (typeof value !== 'object' || value === null || !('data' in value)) return false;
  const data = value.data;
  return (
    typeof data === 'object' &&
    data !== null &&
    'e' in data &&
    data.e === '24hrTicker' &&
    'E' in data &&
    typeof data.E === 'number' &&
    's' in data &&
    typeof data.s === 'string' &&
    'c' in data &&
    typeof data.c === 'string' &&
    'P' in data &&
    typeof data.P === 'string' &&
    'h' in data &&
    typeof data.h === 'string' &&
    'l' in data &&
    typeof data.l === 'string' &&
    'q' in data &&
    typeof data.q === 'string'
  );
}


export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket must be used within a MarketProvider.');
  return context;
}
