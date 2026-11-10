'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock3,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { useMarket } from '@/contexts/MarketContext';
import {
  MARKET_ASSETS,
  MARKET_CURRENCIES,
  type MarketAsset,
  isMarketQuoteFresh,
  isMarketCurrencyCode,
  type MarketQuote,
} from '@/lib/market-config';
import {
  convertMarketValue,
  formatMarketCompactCurrency,
  formatMarketPairPrice,
  formatMarketPercent,
  formatMarketPrice,
  formatMarketTime,
} from '@/lib/market-format';

type MarketDashboardProps = {
  locale: string;
  selectedSlug?: string;
};

function getAssetName(asset: MarketAsset, locale: string) {
  return locale === 'fr' ? asset.frenchName : asset.name;
}

function createChartUrl(symbol: string, locale: string) {
  const params = new URLSearchParams({
    frameElementId: 'malakinfo-market-chart',
    symbol,
    interval: 'D',
    hidesidetoolbar: '0',
    symboledit: '0',
    saveimage: '0',
    toolbarbg: 'f8f9fa',
    studies: '[]',
    theme: 'light',
    style: '1',
    timezone: 'Africa/Kinshasa',
    withdateranges: '1',
    hideideas: '1',
    locale: locale === 'fr' ? 'fr' : 'en',
  });

  return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
}

function ChangeBadge({ change, locale }: { change: number | null; locale: string }) {
  if (change === null) {
    return <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70">—</span>;
  }

  const isDown = change < 0;
  const Icon = isDown ? ArrowDownRight : ArrowUpRight;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
        isDown ? 'bg-[#e63946]/15 text-[#ffb0b5]' : 'bg-[#3bc47d]/15 text-[#9bf0bf]'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {formatMarketPercent(change, locale)}
      <span className="font-medium opacity-70">{locale === 'fr' ? '24 h' : '24h'}</span>
    </span>
  );
}

function MarketCard({
  asset,
  quote,
  locale,
  selected,
  currency,
  exchangeRates,
}: {
  asset: MarketAsset;
  quote?: MarketQuote;
  locale: string;
  selected: boolean;
  currency: string;
  exchangeRates: Record<string, number>;
}) {
  const isFrench = locale === 'fr';
  const isDown = quote?.change24h !== null && quote?.change24h !== undefined && quote.change24h < 0;

  return (
    <Link
      href={`/${locale}/marches/${asset.slug}`}
      aria-current={selected ? 'page' : undefined}
      className={`group rounded-2xl border bg-card p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#d4af37] hover:shadow-lg ${
        selected ? 'border-[#d4af37] shadow-[0_8px_24px_rgba(212,175,55,0.12)]' : 'border-border'
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b3b8b]/[0.08] text-[10px] font-black text-[#0b3b8b] dark:bg-[#4f8ef7]/10 dark:text-[#8db7ff]">
            {asset.symbol}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-foreground">
              {getAssetName(asset, locale)}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {asset.symbol}
            </span>
          </span>
        </div>
        {quote?.change24h !== null && quote?.change24h !== undefined && (
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
              isDown
                ? 'bg-[#e63946]/10 text-[#d62f3b] dark:text-[#ff9a9a]'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-[#8fe0b0]'
            }`}
          >
            {formatMarketPercent(quote.change24h, locale)}
          </span>
        )}
      </div>
      <p className="truncate text-lg font-bold tabular-nums text-foreground">
        {quote
          ? formatMarketPrice(convertMarketValue(quote.priceUsd, exchangeRates, currency), locale, currency)
          : '—'}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {asset.type === 'metal'
          ? isFrench
            ? `once troy · ${currency}`
            : `troy ounce · ${currency}`
          : quote?.marketCapUsd
            ? `${isFrench ? 'Cap. boursière' : 'Market cap'} · ${formatMarketCompactCurrency(convertMarketValue(quote.marketCapUsd, exchangeRates, currency), locale, currency)}`
            : isFrench
              ? 'Capitalisation indisponible'
              : 'Market cap unavailable'}
      </p>
    </Link>
  );
}

export default function MarketDashboard({ locale, selectedSlug }: MarketDashboardProps) {
  const isFrench = locale === 'fr';
  const [assetSearch, setAssetSearch] = useState('');
  const [showAllAssets, setShowAllAssets] = useState(false);
  const selectedAsset =
    MARKET_ASSETS.find((asset) => asset.slug === selectedSlug) ?? MARKET_ASSETS[1];
  const { currency, setCurrency, snapshot, liveQuotes, usdtUsdRate, feedStatus, loading, error } =
    useMarket();

  const quoteById = useMemo(
    () =>
      new Map(
        snapshot?.assets.map((quote) => {
          const candidateLiveQuote = liveQuotes[quote.id];
          const liveQuote =
            candidateLiveQuote && feedStatus === 'live' &&
            isMarketQuoteFresh(candidateLiveQuote.sourceUpdatedAt)
              ? candidateLiveQuote
              : undefined;
          const priceUsdt = liveQuote?.priceUsdt ?? quote.priceUsdt;
          return [
            quote.id,
            priceUsdt !== null
              ? {
                  ...quote,
                  priceUsd: priceUsdt * usdtUsdRate,
                  change24h: liveQuote?.change24h ?? quote.change24hUsdt,
                  high24hUsd: (liveQuote?.high24h ?? quote.high24hUsdt ?? quote.high24hUsd ?? 0) * usdtUsdRate,
                  low24hUsd: (liveQuote?.low24h ?? quote.low24hUsdt ?? quote.low24hUsd ?? 0) * usdtUsdRate,
                  volume24hUsd:
                    (liveQuote?.volume24hUsdt ?? quote.volume24hUsdt ?? quote.volume24hUsd ?? 0) *
                    usdtUsdRate,
                  sourceUpdatedAt:
                    liveQuote?.sourceUpdatedAt ?? quote.sourceUpdatedAtUsdt ?? quote.sourceUpdatedAt,
                }
              : quote,
          ];
        }) ?? [],
      ),
    [snapshot, liveQuotes, usdtUsdRate, feedStatus],
  );
  const selectedQuote = quoteById.get(selectedAsset.id);
  const referenceQuote = snapshot?.assets.find((quote) => quote.id === selectedAsset.id);
  const selectedLiveQuoteCandidate = liveQuotes[selectedAsset.id];
  const selectedLiveQuote =
    selectedLiveQuoteCandidate &&
    feedStatus === 'live' &&
    isMarketQuoteFresh(selectedLiveQuoteCandidate.sourceUpdatedAt)
      ? selectedLiveQuoteCandidate
      : undefined;
  const chartUrl = createChartUrl(selectedAsset.chartSymbol, locale);
  const exchangeRates = snapshot?.exchangeRates;
  const selectedPrice = selectedQuote && exchangeRates
    ? formatMarketPrice(
        convertMarketValue(selectedQuote.priceUsd, exchangeRates, currency),
        locale,
        currency,
      )
    : null;
  const sourceBinanceUrl = `https://www.binance.com/en/trade/${selectedAsset.symbol}_USDT`;
  const sourceCoinGeckoUrl = `https://www.coingecko.com/en/coins/${selectedAsset.id}`;
  const matchingAssets = MARKET_ASSETS.filter((asset) =>
    [asset.name, asset.frenchName, asset.symbol].some((value) =>
      value.toLowerCase().includes(assetSearch.trim().toLowerCase()),
    ),
  );
  const visibleAssets =
    showAllAssets || assetSearch.trim()
      ? matchingAssets
      : matchingAssets.slice(0, 8);
  const hiddenAssetCount = matchingAssets.length - visibleAssets.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <header className="mb-8 flex flex-col gap-3 border-b border-border pb-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#0b3b8b] dark:text-[#8db7ff]">
              <BarChart3 className="h-4 w-4 text-[#d4af37]" />
              {isFrench ? 'Finance · Marchés mondiaux' : 'Finance · Global markets'}
            </p>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {selectedSlug
                ? isFrench
                  ? `Cours de ${selectedAsset.frenchName} (${selectedAsset.symbol}) en direct`
                  : `${selectedAsset.name} (${selectedAsset.symbol}) price live`
                : isFrench
                  ? 'Les marchés en direct'
                  : 'Markets live'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {selectedSlug && selectedAsset.type === 'crypto'
                ? isFrench
                  ? `Suivez ${selectedAsset.symbol}/USDT en direct sur Binance et comparez la référence ${selectedAsset.symbol}/USD sur CoinGecko.`
                  : `Track ${selectedAsset.symbol}/USDT live on Binance and compare the ${selectedAsset.symbol}/USD reference on CoinGecko.`
                : isFrench
                  ? 'Suivez les cours de l’or et des principales cryptomonnaies, actualisés régulièrement.'
                  : 'Follow gold and leading cryptocurrency prices, refreshed regularly.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span>{isFrench ? 'Afficher en' : 'Display in'}</span>
              <select
                aria-label={isFrench ? 'Devise d’affichage' : 'Display currency'}
                value={currency}
                onChange={(event) => {
                  if (isMarketCurrencyCode(event.currentTarget.value)) {
                    setCurrency(event.currentTarget.value);
                  }
                }}
                className="max-w-[210px] rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
              >
                {MARKET_CURRENCIES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {isFrench ? option.shortLabel : option.shortLabelEn}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {feedStatus === 'live'
                ? isFrench
                  ? 'Flux Binance en temps réel'
                  : 'Binance real-time feed'
                : feedStatus === 'connecting'
                  ? isFrench
                    ? 'Connexion au flux live…'
                    : 'Connecting to live feed…'
                  : isFrench
                    ? 'Reconnexion · cours de référence'
                    : 'Reconnecting · reference prices'}
            </div>
          </div>
        </header>

        {error && !snapshot && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-[#e63946]/25 bg-[#e63946]/[0.06] p-4 text-sm text-foreground"
          >
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#e63946]" />
            <p>
              {isFrench
                ? 'Impossible de charger les cotations pour le moment. Veuillez réessayer dans quelques instants.'
                : 'Market quotes could not be loaded. Please try again in a moment.'}
            </p>
          </div>
        )}

        <section
          aria-label={isFrench ? 'Marché sélectionné' : 'Selected market'}
          className="relative overflow-hidden rounded-3xl bg-[#081c3d] p-5 text-white shadow-[0_24px_70px_rgba(8,28,61,0.18)] sm:p-8 lg:p-10"
        >
          <div className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full border border-[#d4af37]/15" />
          <div className="pointer-events-none absolute -right-1 -top-11 h-56 w-56 rounded-full border border-[#d4af37]/20" />
          <div className="pointer-events-none absolute -bottom-28 left-[42%] h-64 w-64 rounded-full bg-[#0b3b8b]/40 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-7 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/35 bg-[#d4af37]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#f0d978]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                  {selectedAsset.type === 'metal'
                    ? isFrench
                      ? 'Métal précieux'
                      : 'Precious metal'
                    : isFrench
                      ? 'Cryptomonnaie'
                      : 'Cryptocurrency'}
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                  {selectedAsset.symbol} / {selectedAsset.type === 'crypto' ? 'USDT' : currency}
                </span>
                {selectedAsset.type === 'crypto' && (
                  <span
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      feedStatus === 'live'
                        ? 'border-emerald-300/30 bg-emerald-300/10 text-[#9bf0bf]'
                        : 'border-white/15 text-white/60'
                    }`}
                  >
                    {feedStatus === 'live'
                      ? isFrench
                        ? 'Temps réel · Binance'
                        : 'Live · Binance'
                      : isFrench
                        ? 'Source de secours'
                        : 'Fallback feed'}
                  </span>
                )}
              </div>

              <p className="mb-1 text-sm font-semibold text-white/70">
                {getAssetName(selectedAsset, locale)}
                {selectedAsset.type === 'metal' &&
                  ` · ${isFrench ? 'once troy' : 'troy ounce'}`}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="font-heading text-4xl font-bold tracking-tight tabular-nums sm:text-5xl lg:text-6xl">
                  {selectedPrice ?? (loading
                      ? '…'
                      : '—')}
                </p>
                <ChangeBadge change={selectedQuote?.change24h ?? null} locale={locale} />
              </div>

              <p className="mt-5 flex items-center gap-2 text-xs text-white/55">
                <Clock3 className="h-3.5 w-3.5" />
                {snapshot
                  ? `${isFrench ? 'Source actualisée à' : 'Source updated at'} ${formatMarketTime(selectedLiveQuote?.sourceUpdatedAt ?? selectedQuote?.sourceUpdatedAt ?? snapshot.generatedAt, locale)} · ${isFrench ? 'Kinshasa' : 'Kinshasa time'}`
                  : isFrench
                    ? 'Connexion aux marchés…'
                    : 'Connecting to market data…'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: isFrench ? 'Plus haut · 24 h' : '24h high',
                  value: selectedQuote?.high24hUsd,
                },
                {
                  label: isFrench ? 'Plus bas · 24 h' : '24h low',
                  value: selectedQuote?.low24hUsd,
                },
                {
                  label: isFrench ? 'Capitalisation' : 'Market cap',
                  value: selectedQuote?.marketCapUsd,
                  compact: true,
                },
                {
                  label: isFrench ? 'Volume · 24 h' : '24h volume',
                  value: selectedQuote?.volume24hUsd,
                  compact: true,
                },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3.5 sm:p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-sm font-bold tabular-nums text-white sm:text-base">
                    {stat.value === undefined || stat.value === null || !exchangeRates
                      ? '—'
                      : stat.compact
                        ? formatMarketCompactCurrency(
                            convertMarketValue(stat.value, exchangeRates, currency),
                            locale,
                            currency,
                          )
                        : formatMarketPrice(
                            convertMarketValue(stat.value, exchangeRates, currency),
                            locale,
                            currency,
                          )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {selectedAsset.type === 'crypto' && (
          <section
            aria-label={
              isFrench
                ? `Cours ${selectedAsset.symbol}/USDT et ${selectedAsset.symbol}/USD`
                : `${selectedAsset.symbol}/USDT and ${selectedAsset.symbol}/USD prices`
            }
            className="mt-5 grid gap-3 sm:grid-cols-2"
          >
            <div className="rounded-2xl border border-[#0b3b8b]/20 bg-card p-4 shadow-sm dark:border-[#4f8ef7]/20">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0b3b8b] dark:text-[#8db7ff]">
                {selectedAsset.symbol}/USDT ·{' '}
                {selectedLiveQuote
                  ? isFrench
                    ? 'cours spot en direct'
                    : 'live spot price'
                  : isFrench
                    ? 'dernier cours spot Binance'
                    : 'latest Binance spot quote'}
              </p>
              <p className="mt-2 text-xl font-bold tabular-nums text-foreground">
                {selectedLiveQuote
                  ? formatMarketPairPrice(selectedLiveQuote.priceUsdt, locale, 'USDT')
                  : selectedQuote?.priceUsdt !== null && selectedQuote?.priceUsdt !== undefined
                    ? formatMarketPairPrice(selectedQuote.priceUsdt, locale, 'USDT')
                  : '—'}
              </p>
              <a
                href={sourceBinanceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-xs font-semibold text-[#0b3b8b] underline decoration-[#d4af37] underline-offset-4 hover:text-[#d4af37] dark:text-[#8db7ff]"
              >
                {isFrench ? 'Vérifier sur Binance' : 'Verify on Binance'}
              </a>
              <a
                href={`https://api.binance.com/api/v3/ticker/24hr?symbol=${selectedAsset.symbol}USDT`}
                target="_blank"
                rel="noreferrer"
                className="ml-4 inline-flex text-xs font-semibold text-muted-foreground underline decoration-[#d4af37] underline-offset-4 hover:text-[#d4af37]"
              >
                {isFrench ? 'Données Binance (JSON)' : 'Binance data (JSON)'}
              </a>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                {selectedAsset.symbol}/USD · {isFrench ? 'référence du marché' : 'market reference'}
              </p>
              <p className="mt-2 text-xl font-bold tabular-nums text-foreground">
                {referenceQuote
                  ? formatMarketPairPrice(
                      referenceQuote.priceUsd,
                      locale,
                      'USD',
                    )
                  : '—'}
              </p>
              <a
                href={sourceCoinGeckoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-xs font-semibold text-[#0b3b8b] underline decoration-[#d4af37] underline-offset-4 hover:text-[#d4af37] dark:text-[#8db7ff]"
              >
                {isFrench ? 'Vérifier sur CoinGecko' : 'Verify on CoinGecko'}
              </a>
            </div>
          </section>
        )}

        <section className="mt-10 sm:mt-12">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#0b3b8b] dark:text-[#8db7ff]">
                {isFrench ? 'Panorama' : 'Overview'}
              </p>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                {isFrench ? 'Actifs suivis' : 'Tracked assets'}
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <p className="text-xs text-muted-foreground">
                {isFrench ? `Cours indicatifs en ${currency}` : `Indicative prices in ${currency}`}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="search"
                    value={assetSearch}
                    onChange={(event) => setAssetSearch(event.currentTarget.value)}
                    placeholder={isFrench ? 'Rechercher une crypto' : 'Search crypto'}
                    aria-label={isFrench ? 'Rechercher un actif' : 'Search assets'}
                    className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                  />
                </label>
                {!assetSearch.trim() && (hiddenAssetCount > 0 || showAllAssets) && (
                  <button
                    type="button"
                    onClick={() => setShowAllAssets((showAll) => !showAll)}
                    className="rounded-lg border border-[#0b3b8b]/20 px-3 py-2 text-xs font-semibold text-[#0b3b8b] transition-colors hover:bg-[#0b3b8b]/[0.06] dark:border-[#4f8ef7]/30 dark:text-[#8db7ff] dark:hover:bg-[#4f8ef7]/10"
                  >
                    {showAllAssets
                      ? isFrench
                        ? 'Afficher moins'
                        : 'Show less'
                      : isFrench
                        ? `Voir plus de cryptos (${hiddenAssetCount})`
                        : `See more crypto (${hiddenAssetCount})`}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {visibleAssets.map((asset) => (
              <MarketCard
                key={asset.id}
                asset={asset}
                quote={quoteById.get(asset.id)}
                locale={locale}
                selected={asset.id === selectedAsset.id}
                currency={currency}
                exchangeRates={exchangeRates ?? {}}
              />
            ))}
          </div>
          {visibleAssets.length === 0 && (
            <p role="status" className="rounded-xl border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
              {isFrench ? 'Aucun actif ne correspond à cette recherche.' : 'No assets match this search.'}
            </p>
          )}
        </section>

        <section className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-sm sm:mt-12">
          <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b3b8b] dark:text-[#8db7ff]">
                {isFrench ? 'Graphique du marché' : 'Market chart'}
              </p>
              <h2 className="mt-1 font-heading text-xl font-bold text-foreground">
                {getAssetName(selectedAsset, locale)} <span className="text-muted-foreground">· {selectedAsset.symbol}/USD</span>
              </h2>
            </div>
            <a
              href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(selectedAsset.chartSymbol)}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-[#0b3b8b] underline decoration-[#d4af37] underline-offset-4 transition-colors hover:text-[#d4af37] dark:text-[#8db7ff]"
            >
              {isFrench ? 'Ouvrir sur TradingView' : 'Open on TradingView'}
            </a>
          </div>
          <iframe
            key={selectedAsset.id}
            title={`${getAssetName(selectedAsset, locale)} ${isFrench ? 'graphique de marché' : 'market chart'}`}
            src={chartUrl}
            className="h-[390px] w-full border-0 sm:h-[500px]"
            loading="lazy"
            allow="fullscreen"
          />
        </section>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#d4af37]" />
          <p>
            {isFrench
            ? `Les cours ${selectedAsset.symbol}/USDT reçoivent les cotations spot de Binance en continu. La référence ${selectedAsset.symbol}/USD provient de CoinGecko et peut être actualisée moins fréquemment. Les taux de conversion sont indicatifs. Les prix peuvent varier selon les plateformes et ne constituent pas un conseil en investissement.`
            : `${selectedAsset.symbol}/USDT spot prices stream from Binance continuously. The ${selectedAsset.symbol}/USD reference comes from CoinGecko and may update less frequently. Currency conversions are indicative. Prices may vary by platform and are not investment advice.`}
          </p>
        </div>

        {error && snapshot && (
          <p role="status" className="mt-3 text-right text-xs text-muted-foreground">
            {isFrench
              ? 'La dernière actualisation a échoué ; les cours affichés peuvent être périmés.'
              : 'The latest refresh failed; displayed quotes may be out of date.'}
          </p>
        )}
      </div>
    </div>
  );
}
