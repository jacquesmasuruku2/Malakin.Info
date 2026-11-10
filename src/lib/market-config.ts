export const MARKET_ASSETS = [
  {
    id: 'gold',
    slug: 'or',
    symbol: 'XAU',
    name: 'Gold',
    frenchName: 'Or',
    type: 'metal',
    chartSymbol: 'OANDA:XAUUSD',
  },
  {
    id: 'bitcoin',
    slug: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    frenchName: 'Bitcoin',
    type: 'crypto',
    chartSymbol: 'BINANCE:BTCUSDT',
  },
  {
    id: 'ethereum',
    slug: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    frenchName: 'Ethereum',
    type: 'crypto',
    chartSymbol: 'BINANCE:ETHUSDT',
  },
  {
    id: 'cardano',
    slug: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    frenchName: 'Cardano',
    type: 'crypto',
    chartSymbol: 'BINANCE:ADAUSDT',
  },
  {
    id: 'solana',
    slug: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    frenchName: 'Solana',
    type: 'crypto',
    chartSymbol: 'BINANCE:SOLUSDT',
  },
  {
    id: 'binancecoin',
    slug: 'bnb',
    symbol: 'BNB',
    name: 'BNB',
    frenchName: 'BNB',
    type: 'crypto',
    chartSymbol: 'BINANCE:BNBUSDT',
  },
  {
    id: 'ripple',
    slug: 'xrp',
    symbol: 'XRP',
    name: 'XRP',
    frenchName: 'XRP',
    type: 'crypto',
    chartSymbol: 'BINANCE:XRPUSDT',
  },
  {
    id: 'dogecoin',
    slug: 'dogecoin',
    symbol: 'DOGE',
    name: 'Dogecoin',
    frenchName: 'Dogecoin',
    type: 'crypto',
    chartSymbol: 'BINANCE:DOGEUSDT',
  },
  {
    id: 'chainlink',
    slug: 'chainlink',
    symbol: 'LINK',
    name: 'Chainlink',
    frenchName: 'Chainlink',
    type: 'crypto',
    chartSymbol: 'BINANCE:LINKUSDT',
  },
  {
    id: 'avalanche-2',
    slug: 'avalanche',
    symbol: 'AVAX',
    name: 'Avalanche',
    frenchName: 'Avalanche',
    type: 'crypto',
    chartSymbol: 'BINANCE:AVAXUSDT',
  },
  {
    id: 'tron',
    slug: 'tron',
    symbol: 'TRX',
    name: 'TRON',
    frenchName: 'TRON',
    type: 'crypto',
    chartSymbol: 'BINANCE:TRXUSDT',
  },
  {
    id: 'polkadot',
    slug: 'polkadot',
    symbol: 'DOT',
    name: 'Polkadot',
    frenchName: 'Polkadot',
    type: 'crypto',
    chartSymbol: 'BINANCE:DOTUSDT',
  },
  {
    id: 'litecoin',
    slug: 'litecoin',
    symbol: 'LTC',
    name: 'Litecoin',
    frenchName: 'Litecoin',
    type: 'crypto',
    chartSymbol: 'BINANCE:LTCUSDT',
  },
  {
    id: 'shiba-inu',
    slug: 'shiba-inu',
    symbol: 'SHIB',
    name: 'Shiba Inu',
    frenchName: 'Shiba Inu',
    type: 'crypto',
    chartSymbol: 'BINANCE:SHIBUSDT',
  },
  {
    id: 'bitcoin-cash',
    slug: 'bitcoin-cash',
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    frenchName: 'Bitcoin Cash',
    type: 'crypto',
    chartSymbol: 'BINANCE:BCHUSDT',
  },
  {
    id: 'stellar',
    slug: 'stellar',
    symbol: 'XLM',
    name: 'Stellar',
    frenchName: 'Stellar',
    type: 'crypto',
    chartSymbol: 'BINANCE:XLMUSDT',
  },
] as const;

export type MarketAsset = (typeof MARKET_ASSETS)[number];
export type MarketAssetId = MarketAsset['id'];

export type MarketQuote = {
  id: MarketAssetId;
  slug: MarketAsset['slug'];
  symbol: MarketAsset['symbol'];
  name: MarketAsset['name'];
  frenchName: MarketAsset['frenchName'];
  type: MarketAsset['type'];
  chartSymbol: MarketAsset['chartSymbol'];
  priceUsd: number;
  priceUsdt: number | null;
  change24h: number | null;
  change24hUsdt: number | null;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  high24hUsd: number | null;
  low24hUsd: number | null;
  high24hUsdt: number | null;
  low24hUsdt: number | null;
  volume24hUsdt: number | null;
  sourceUpdatedAt: string | null;
  sourceUpdatedAtUsdt: string | null;
};

export type MarketSnapshot = {
  assets: MarketQuote[];
  exchangeRates: Record<MarketCurrencyCode, number>;
  generatedAt: string;
};

export const MARKET_CURRENCIES = [
  { code: 'USD', shortLabel: 'USD · Dollar américain', shortLabelEn: 'USD · US dollar' },
  { code: 'CDF', shortLabel: 'CDF · Franc congolais', shortLabelEn: 'CDF · Congolese franc' },
  { code: 'EUR', shortLabel: 'EUR · Euro', shortLabelEn: 'EUR · Euro' },
  {
    code: 'XAF',
    shortLabel: 'XAF · Franc CFA (Afrique centrale)',
    shortLabelEn: 'XAF · Central African CFA franc',
  },
  {
    code: 'XOF',
    shortLabel: 'XOF · Franc CFA (Afrique de l’Ouest)',
    shortLabelEn: 'XOF · West African CFA franc',
  },
  { code: 'NGN', shortLabel: 'NGN · Naira nigérian', shortLabelEn: 'NGN · Nigerian naira' },
  { code: 'ZAR', shortLabel: 'ZAR · Rand sud-africain', shortLabelEn: 'ZAR · South African rand' },
  { code: 'KES', shortLabel: 'KES · Shilling kényan', shortLabelEn: 'KES · Kenyan shilling' },
  { code: 'GHS', shortLabel: 'GHS · Cedi ghanéen', shortLabelEn: 'GHS · Ghanaian cedi' },
  { code: 'MAD', shortLabel: 'MAD · Dirham marocain', shortLabelEn: 'MAD · Moroccan dirham' },
  { code: 'EGP', shortLabel: 'EGP · Livre égyptienne', shortLabelEn: 'EGP · Egyptian pound' },
  { code: 'GBP', shortLabel: 'GBP · Livre sterling', shortLabelEn: 'GBP · British pound' },
  { code: 'CHF', shortLabel: 'CHF · Franc suisse', shortLabelEn: 'CHF · Swiss franc' },
  { code: 'CAD', shortLabel: 'CAD · Dollar canadien', shortLabelEn: 'CAD · Canadian dollar' },
  { code: 'AUD', shortLabel: 'AUD · Dollar australien', shortLabelEn: 'AUD · Australian dollar' },
] as const;

export type MarketCurrencyCode = (typeof MARKET_CURRENCIES)[number]['code'];
export const DEFAULT_MARKET_CURRENCY: MarketCurrencyCode = 'USD';

function isOptionalNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

function isCurrencyCode(value: unknown): value is MarketCurrencyCode {
  return MARKET_CURRENCIES.some((currency) => currency.code === value);
}

export function isMarketSnapshot(value: unknown): value is MarketSnapshot {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('generatedAt' in value) ||
    typeof value.generatedAt !== 'string' ||
    Number.isNaN(Date.parse(value.generatedAt)) ||
    !('assets' in value) ||
    !Array.isArray(value.assets) ||
    value.assets.length !== MARKET_ASSETS.length ||
    !('exchangeRates' in value) ||
    typeof value.exchangeRates !== 'object' ||
    value.exchangeRates === null
  ) {
    return false;
  }

  const rates = value.exchangeRates as Record<string, unknown>;
  if (
    !MARKET_CURRENCIES.every(
      (currency) => isPositiveFiniteNumber(rates[currency.code]),
    )
  ) {
    return false;
  }

  const assetIds = new Set<string>();
  return value.assets.every((quote: unknown) => {
    if (typeof quote !== 'object' || quote === null) return false;
    const asset = quote as Record<string, unknown>;

    const isValid =
      typeof asset.id === 'string' &&
      MARKET_ASSETS.some((knownAsset) => knownAsset.id === asset.id) &&
      typeof asset.slug === 'string' &&
      typeof asset.symbol === 'string' &&
      typeof asset.name === 'string' &&
      typeof asset.frenchName === 'string' &&
      (asset.type === 'metal' || asset.type === 'crypto') &&
      typeof asset.chartSymbol === 'string' &&
      typeof asset.priceUsd === 'number' &&
      Number.isFinite(asset.priceUsd) &&
      isOptionalNumber(asset.priceUsdt) &&
      isOptionalNumber(asset.change24h) &&
      isOptionalNumber(asset.change24hUsdt) &&
      isOptionalNumber(asset.marketCapUsd) &&
      isOptionalNumber(asset.volume24hUsd) &&
      isOptionalNumber(asset.high24hUsd) &&
      isOptionalNumber(asset.low24hUsd) &&
      isOptionalNumber(asset.high24hUsdt) &&
      isOptionalNumber(asset.low24hUsdt) &&
      isOptionalNumber(asset.volume24hUsdt) &&
      (typeof asset.sourceUpdatedAt === 'string' &&
      !Number.isNaN(Date.parse(asset.sourceUpdatedAt)) ||
        asset.sourceUpdatedAt === null) &&
      (typeof asset.sourceUpdatedAtUsdt === 'string' &&
      !Number.isNaN(Date.parse(asset.sourceUpdatedAtUsdt)) ||
        asset.sourceUpdatedAtUsdt === null);

    if (!isValid || typeof asset.id !== 'string' || assetIds.has(asset.id)) return false;
    assetIds.add(asset.id);
    return true;
  });
}

export function isMarketCurrencyCode(value: unknown): value is MarketCurrencyCode {
  return isCurrencyCode(value);
}

export function isMarketQuoteFresh(sourceUpdatedAt: string, now = Date.now()) {
  const updatedAt = Date.parse(sourceUpdatedAt);
  return Number.isFinite(updatedAt) && now >= updatedAt && now - updatedAt <= 10_000;
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}
