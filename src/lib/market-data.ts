import {
  MARKET_ASSETS,
  MARKET_CURRENCIES,
  type MarketCurrencyCode,
  type MarketQuote,
  type MarketSnapshot,
} from '@/lib/market-config';

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,cardano,solana,binancecoin,ripple,dogecoin,chainlink,avalanche-2,tron,polkadot,litecoin,shiba-inu,bitcoin-cash,stellar&price_change_percentage=24h';
const GOLD_API_URL = 'https://api.gold-api.com/price/XAU';
const EXCHANGE_RATES_URL = 'https://open.er-api.com/v6/latest/USD';
const EXCHANGE_RATES_FALLBACK_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
const MARKET_CACHE_SECONDS = 2;
const EXCHANGE_RATE_CACHE_SECONDS = 21_600;
const COINGECKO_TIMEOUT_MS = 5_000;

type CoinGeckoMarketRow = {
  id: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
  last_updated: string | null;
};

type BinanceTickerRow = {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  quoteVolume: number;
  closeTime: number;
};

let marketSnapshotCache:
  | { expiresAt: number; snapshotPromise: Promise<MarketSnapshot> }
  | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function finiteNumberFromString(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCoinGeckoRows(value: unknown): CoinGeckoMarketRow[] {
  if (!Array.isArray(value)) {
    throw new Error('CoinGecko returned an invalid market response.');
  }

  return value.map((row) => {
    const currentPrice = isRecord(row) ? finiteNumber(row.current_price) : null;
    if (
      !isRecord(row) ||
      typeof row.id !== 'string' ||
      currentPrice === null
    ) {
      throw new Error('CoinGecko returned an incomplete market quote.');
    }

    return {
      id: row.id,
      current_price: currentPrice,
      price_change_percentage_24h: finiteNumber(row.price_change_percentage_24h),
      market_cap: finiteNumber(row.market_cap),
      total_volume: finiteNumber(row.total_volume),
      high_24h: finiteNumber(row.high_24h),
      low_24h: finiteNumber(row.low_24h),
      last_updated:
        typeof row.last_updated === 'string' && !Number.isNaN(Date.parse(row.last_updated))
          ? row.last_updated
          : null,
    };
  });
}

function parseBinanceRows(value: unknown): BinanceTickerRow[] {
  if (!Array.isArray(value)) {
    throw new Error('Binance returned an invalid market response.');
  }

  return value.map((row) => {
    const lastPrice = isRecord(row) ? finiteNumberFromString(row.lastPrice) : null;
    const priceChangePercent = isRecord(row)
      ? finiteNumberFromString(row.priceChangePercent)
      : null;
    const highPrice = isRecord(row) ? finiteNumberFromString(row.highPrice) : null;
    const lowPrice = isRecord(row) ? finiteNumberFromString(row.lowPrice) : null;
    const quoteVolume = isRecord(row) ? finiteNumberFromString(row.quoteVolume) : null;

    if (
      !isRecord(row) ||
      typeof row.symbol !== 'string' ||
      lastPrice === null ||
      priceChangePercent === null ||
      highPrice === null ||
      lowPrice === null ||
      quoteVolume === null ||
      typeof row.closeTime !== 'number' ||
      !Number.isFinite(row.closeTime)
    ) {
      throw new Error('Binance returned an incomplete market quote.');
    }

    return {
      symbol: row.symbol,
      lastPrice,
      priceChangePercent,
      highPrice,
      lowPrice,
      quoteVolume,
      closeTime: row.closeTime,
    };
  });
}

function createCryptoQuote(
  asset: (typeof MARKET_ASSETS)[number],
  row: CoinGeckoMarketRow | undefined,
  binanceRow: BinanceTickerRow | undefined,
): MarketQuote | null {
  const priceUsd = row?.current_price ?? binanceRow?.lastPrice;
  if (priceUsd === undefined) return null;

  return {
    ...asset,
    // USDT is the live Binance quote fallback when CoinGecko is unavailable.
    priceUsd,
    priceUsdt: binanceRow?.lastPrice ?? null,
    change24h: row?.price_change_percentage_24h ?? binanceRow?.priceChangePercent ?? null,
    change24hUsdt: binanceRow?.priceChangePercent ?? null,
    marketCapUsd: row?.market_cap ?? null,
    volume24hUsd: row?.total_volume ?? binanceRow?.quoteVolume ?? null,
    high24hUsd: row?.high_24h ?? binanceRow?.highPrice ?? null,
    low24hUsd: row?.low_24h ?? binanceRow?.lowPrice ?? null,
    high24hUsdt: binanceRow?.highPrice ?? null,
    low24hUsdt: binanceRow?.lowPrice ?? null,
    volume24hUsdt: binanceRow?.quoteVolume ?? null,
    sourceUpdatedAt:
      row?.last_updated ??
      (binanceRow ? new Date(binanceRow.closeTime).toISOString() : null),
    sourceUpdatedAtUsdt: binanceRow ? new Date(binanceRow.closeTime).toISOString() : null,
  };
}

async function getOptionalJson(
  result: PromiseSettledResult<Response>,
  source: string,
): Promise<unknown | null> {
  if (result.status === 'rejected') {
    console.warn(`${source} request failed:`, result.reason);
    return null;
  }
  if (!result.value.ok) {
    console.warn(`${source} responded with HTTP ${result.value.status}.`);
    return null;
  }
  try {
    return await result.value.json();
  } catch (error) {
    console.warn(`${source} returned invalid JSON:`, error);
    return null;
  }
}

async function fetchOptionalJson(
  url: string,
  source: string,
  revalidate: number,
): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.warn(`${source} responded with HTTP ${response.status}.`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`${source} request failed:`, error);
    return null;
  }
}

async function getOptionalCoinGeckoRows(
  result: PromiseSettledResult<Response>,
): Promise<CoinGeckoMarketRow[] | null> {
  const data = await getOptionalJson(result, 'CoinGecko market metadata');
  if (data === null) return null;

  try {
    return parseCoinGeckoRows(data);
  } catch (error) {
    console.warn('CoinGecko returned invalid market metadata; using Binance quotes:', error);
    return null;
  }
}

function parseExchangeRates(value: unknown): Record<MarketCurrencyCode, number> {
  const isPrimaryResponse =
    isRecord(value) && value.result === 'success' && value.base_code === 'USD';
  const isFallbackResponse = isRecord(value) && value.base === 'USD';
  if (
    !isRecord(value) ||
    (!isPrimaryResponse && !isFallbackResponse) ||
    !isRecord(value.rates)
  ) {
    throw new Error('Exchange rate API returned invalid rates.');
  }

  const rates = value.rates;
  return Object.fromEntries(
    MARKET_CURRENCIES.map((currency) => {
      const rate = finiteNumber(rates[currency.code]);
      if (rate === null || rate <= 0) {
        throw new Error(`Exchange rate API did not return ${currency.code}.`);
      }
      return [currency.code, rate];
    }),
  ) as Record<MarketCurrencyCode, number>;
}

async function getExchangeRates(
  result: PromiseSettledResult<Response>,
): Promise<Record<MarketCurrencyCode, number>> {
  const primaryData = await getOptionalJson(result, 'Exchange rate API');
  if (primaryData !== null) {
    try {
      return parseExchangeRates(primaryData);
    } catch (error) {
      console.warn('Exchange rate API returned invalid rates; trying fallback:', error);
    }
  }

  const fallbackData = await fetchOptionalJson(
    EXCHANGE_RATES_FALLBACK_URL,
    'Exchange rate fallback API',
    EXCHANGE_RATE_CACHE_SECONDS,
  );
  if (fallbackData !== null) {
    try {
      return parseExchangeRates(fallbackData);
    } catch (error) {
      console.error('Exchange rate fallback API returned invalid rates:', error);
    }
  }

  throw new Error('All exchange rate providers are unavailable.');
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  if (marketSnapshotCache && marketSnapshotCache.expiresAt > Date.now()) {
    return marketSnapshotCache.snapshotPromise;
  }

  const snapshotPromise = (async () => {
    const symbols = MARKET_ASSETS
      .filter((asset) => asset.type === 'crypto')
      .map((asset) => `${asset.symbol}USDT`);
    const binanceUrl = new URL('https://api.binance.com/api/v3/ticker/24hr');
    binanceUrl.searchParams.set('symbols', JSON.stringify(symbols));

    const [cryptoResult, goldResult, exchangeRatesResult, binanceResult] = await Promise.allSettled([
      fetch(COINGECKO_URL, {
        next: { revalidate: MARKET_CACHE_SECONDS },
        signal: AbortSignal.timeout(COINGECKO_TIMEOUT_MS),
      }),
      fetch(GOLD_API_URL, {
        next: { revalidate: MARKET_CACHE_SECONDS },
        signal: AbortSignal.timeout(10_000),
      }),
      fetch(EXCHANGE_RATES_URL, {
        next: { revalidate: EXCHANGE_RATE_CACHE_SECONDS },
        signal: AbortSignal.timeout(10_000),
      }),
      fetch(binanceUrl, {
        next: { revalidate: MARKET_CACHE_SECONDS },
        signal: AbortSignal.timeout(10_000),
      }),
    ]);

    const cryptoRows = await getOptionalCoinGeckoRows(cryptoResult);

    const [goldData, exchangeRates, binanceData] = await Promise.all([
      getOptionalJson(goldResult, 'Gold API'),
      getExchangeRates(exchangeRatesResult),
      getOptionalJson(binanceResult, 'Binance market data'),
    ]);
    const cryptoById = new Map((cryptoRows ?? []).map((row) => [row.id, row]));
    let binanceRows: BinanceTickerRow[] = [];
    if (binanceData !== null) {
      try {
        binanceRows = parseBinanceRows(binanceData);
      } catch (error) {
        console.warn('Binance returned invalid market data; using CoinGecko quotes:', error);
      }
    }
    const binanceBySymbol = new Map(binanceRows.map((row) => [row.symbol, row]));
    const goldPrice = isRecord(goldData) ? finiteNumber(goldData.price) : null;

    const goldAsset = MARKET_ASSETS.find((asset) => asset.id === 'gold');
    const goldQuote: MarketQuote | null =
      goldAsset && isRecord(goldData) && goldPrice !== null && goldData.symbol === 'XAU'
        ? {
            ...goldAsset,
            priceUsd: goldPrice,
            priceUsdt: null,
            change24h: null,
            change24hUsdt: null,
            marketCapUsd: null,
            volume24hUsd: null,
            high24hUsd: null,
            low24hUsd: null,
            high24hUsdt: null,
            low24hUsdt: null,
            volume24hUsdt: null,
            sourceUpdatedAt:
              typeof goldData.updatedAt === 'string' &&
              !Number.isNaN(Date.parse(goldData.updatedAt))
                ? goldData.updatedAt
                : null,
            sourceUpdatedAtUsdt: null,
          }
        : null;
    if (!goldQuote) {
      console.warn('Gold API returned invalid or unavailable market data; omitting gold quote.');
    }

    const cryptoQuotes = MARKET_ASSETS.filter((asset) => asset.type === 'crypto').flatMap((asset) => {
      const quote = createCryptoQuote(
        asset,
        cryptoById.get(asset.id),
        binanceBySymbol.get(`${asset.symbol}USDT`),
      );
      if (!quote) {
        console.warn(`No market provider returned a quote for ${asset.symbol}; omitting it.`);
        return [];
      }
      return [quote];
    });
    if (cryptoQuotes.length === 0) {
      throw new Error('No crypto market provider returned usable quotes.');
    }

    return {
      assets: [...(goldQuote ? [goldQuote] : []), ...cryptoQuotes],
      exchangeRates,
      generatedAt: new Date().toISOString(),
    };
  })();

  marketSnapshotCache = {
    expiresAt: Number.POSITIVE_INFINITY,
    snapshotPromise,
  };

  try {
    const snapshot = await snapshotPromise;
    if (marketSnapshotCache?.snapshotPromise === snapshotPromise) {
      marketSnapshotCache.expiresAt = Date.now() + MARKET_CACHE_SECONDS * 1000;
    }
    return snapshot;
  } catch (error) {
    if (marketSnapshotCache?.snapshotPromise === snapshotPromise) {
      marketSnapshotCache = undefined;
    }
    throw error;
  }
}
