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
const MARKET_CACHE_SECONDS = 2;
const EXCHANGE_RATE_CACHE_SECONDS = 21_600;

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
  row: CoinGeckoMarketRow,
  binanceRow: BinanceTickerRow,
): MarketQuote {
  return {
    ...asset,
    priceUsd: row.current_price,
    priceUsdt: binanceRow.lastPrice,
    change24h: row.price_change_percentage_24h,
    change24hUsdt: binanceRow.priceChangePercent,
    marketCapUsd: row.market_cap,
    volume24hUsd: row.total_volume,
    high24hUsd: row.high_24h,
    low24hUsd: row.low_24h,
    high24hUsdt: binanceRow.highPrice,
    low24hUsdt: binanceRow.lowPrice,
    volume24hUsdt: binanceRow.quoteVolume,
    sourceUpdatedAt: row.last_updated,
    sourceUpdatedAtUsdt: new Date(binanceRow.closeTime).toISOString(),
  };
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

    const [cryptoResponse, goldResponse, exchangeRatesResponse, binanceResponse] = await Promise.all([
      fetch(COINGECKO_URL, {
        next: { revalidate: MARKET_CACHE_SECONDS },
        signal: AbortSignal.timeout(10_000),
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

    if (!cryptoResponse.ok) {
      throw new Error(`CoinGecko responded with HTTP ${cryptoResponse.status}.`);
    }
    if (!goldResponse.ok) {
      throw new Error(`Gold API responded with HTTP ${goldResponse.status}.`);
    }
    if (!exchangeRatesResponse.ok) {
      throw new Error(`Exchange rate API responded with HTTP ${exchangeRatesResponse.status}.`);
    }
    if (!binanceResponse.ok) {
      throw new Error(`Binance responded with HTTP ${binanceResponse.status}.`);
    }

    const [cryptoData, goldData, exchangeRatesData, binanceData]: [
      unknown,
      unknown,
      unknown,
      unknown,
    ] =
      await Promise.all([
        cryptoResponse.json(),
        goldResponse.json(),
        exchangeRatesResponse.json(),
        binanceResponse.json(),
      ]);
    const cryptoRows = parseCoinGeckoRows(cryptoData);
    const cryptoById = new Map(cryptoRows.map((row) => [row.id, row]));
    const binanceRows = parseBinanceRows(binanceData);
    const binanceBySymbol = new Map(binanceRows.map((row) => [row.symbol, row]));
    const goldPrice = isRecord(goldData) ? finiteNumber(goldData.price) : null;

    if (
      !isRecord(goldData) ||
      goldPrice === null ||
      goldData.symbol !== 'XAU'
    ) {
      throw new Error('Gold API returned an invalid market quote.');
    }
    if (
      !isRecord(exchangeRatesData) ||
      exchangeRatesData.result !== 'success' ||
      exchangeRatesData.base_code !== 'USD' ||
      !isRecord(exchangeRatesData.rates)
    ) {
      throw new Error('Exchange rate API returned invalid rates.');
    }

    const rates = exchangeRatesData.rates;
    const exchangeRates = Object.fromEntries(
      MARKET_CURRENCIES.map((currency) => {
        const rate = finiteNumber(rates[currency.code]);
        if (rate === null || rate <= 0) {
          throw new Error(`Exchange rate API did not return ${currency.code}.`);
        }
        return [currency.code, rate];
      }),
    ) as Record<MarketCurrencyCode, number>;

    const goldAsset = MARKET_ASSETS.find((asset) => asset.id === 'gold');
    if (!goldAsset) {
      throw new Error('The gold market asset is not configured.');
    }

    const goldQuote: MarketQuote = {
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
        typeof goldData.updatedAt === 'string' && !Number.isNaN(Date.parse(goldData.updatedAt))
          ? goldData.updatedAt
          : null,
      sourceUpdatedAtUsdt: null,
    };

    const cryptoQuotes = MARKET_ASSETS.filter((asset) => asset.type === 'crypto').map((asset) => {
      const row = cryptoById.get(asset.id);
      if (!row) {
        throw new Error(`CoinGecko did not return a quote for ${asset.id}.`);
      }
      const binanceRow = binanceBySymbol.get(`${asset.symbol}USDT`);
      if (!binanceRow) {
        throw new Error(`Binance did not return a quote for ${asset.symbol}USDT.`);
      }
      return createCryptoQuote(asset, row, binanceRow);
    });

    return {
      assets: [goldQuote, ...cryptoQuotes],
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
