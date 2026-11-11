'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Pause, Play, Radio } from 'lucide-react';
import { useMarket } from '@/contexts/MarketContext';
import { isMarketQuoteFresh, MARKET_ASSETS } from '@/lib/market-config';
import {
  convertMarketValue,
  formatMarketPrice,
} from '@/lib/market-format';

type MarketTickerProps = {
  locale: string;
};

export default function MarketTicker({ locale }: MarketTickerProps) {
  const { currency, snapshot, liveQuotes, usdtUsdRate, loading, error } = useMarket();
  const [isPaused, setIsPaused] = useState(false);

  const isFrench = locale === 'fr';
  const tickerAssets = (snapshot?.assets ?? MARKET_ASSETS).filter(
    (asset) => asset.type === 'crypto',
  );
  const visibleAssets = tickerAssets.filter((asset) => {
    if (snapshot) return true;
    const quote = liveQuotes[asset.id];
    return quote && isMarketQuoteFresh(quote.sourceUpdatedAt);
  });
  const hasTickerData = snapshot !== null || visibleAssets.length > 0;
  const displayCurrency = snapshot ? currency : 'USD';

  return (
    <div className="border-b border-border bg-background text-foreground">
      <div className="mx-auto flex min-h-12 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        {error && !hasTickerData ? (
          <p className="min-w-0 flex-1 text-xs text-muted-foreground">
            {isFrench ? 'Cours momentanément indisponibles' : 'Quotes temporarily unavailable'}
          </p>
        ) : hasTickerData ? (
          <>
            <div
              className="market-ticker-viewport min-w-0 flex-1 overflow-hidden py-2"
              aria-label={isFrench ? 'Noms et cours des cryptomonnaies' : 'Cryptocurrency names and prices'}
            >
              <div
                className="market-ticker-track flex w-max items-center"
                style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
              >
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    className="flex w-max flex-none items-center"
                    aria-hidden={copy === 1 ? true : undefined}
                    inert={copy === 1}
                  >
                    {visibleAssets.map((asset) => {
                      const candidateLiveQuote = liveQuotes[asset.id];
                      const liveQuote =
                        candidateLiveQuote &&
                        isMarketQuoteFresh(candidateLiveQuote.sourceUpdatedAt)
                          ? candidateLiveQuote
                          : undefined;
                      const snapshotQuote = snapshot?.assets.find((quote) => quote.id === asset.id);
                      const priceUsdt = liveQuote?.priceUsdt ?? snapshotQuote?.priceUsdt ?? null;
                      const change24h =
                        liveQuote?.change24h ??
                        snapshotQuote?.change24hUsdt ??
                        snapshotQuote?.change24h ??
                        null;
                      const trendClass =
                        change24h === null || change24h === 0
                          ? 'text-muted-foreground'
                          : change24h > 0
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-red-700 dark:text-red-400';
                      const TrendIcon =
                        change24h === null || change24h === 0
                          ? null
                          : change24h > 0
                            ? ArrowUpRight
                            : ArrowDownRight;
                      const content = (
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          <span className={`text-xs font-bold ${trendClass}`}>
                            {isFrench ? asset.frenchName : asset.name}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                            {asset.symbol}
                          </span>
                          <span className={`text-xs font-bold tabular-nums ${trendClass}`}>
                            {TrendIcon && <TrendIcon aria-hidden="true" className="mr-0.5 inline h-3 w-3" />}
                            {snapshot && priceUsdt !== null
                              ? formatMarketPrice(
                                  convertMarketValue(
                                    priceUsdt * usdtUsdRate,
                                    snapshot.exchangeRates,
                                    currency,
                                  ),
                                  locale,
                                  currency,
                                )
                              : snapshot && snapshotQuote
                                ? formatMarketPrice(
                                    convertMarketValue(
                                      snapshotQuote.priceUsd,
                                      snapshot.exchangeRates,
                                      currency,
                                    ),
                                    locale,
                                    currency,
                                  )
                                : liveQuote
                                  ? formatMarketPrice(
                                      liveQuote.priceUsdt * usdtUsdRate,
                                      locale,
                                      displayCurrency,
                                    )
                                  : '—'}
                          </span>
                        </span>
                      );
                      const itemClassName =
                        'flex shrink-0 items-center rounded-lg px-4 py-1.5 transition-colors hover:bg-muted';

                      return copy === 0 ? (
                        <Link
                          key={asset.id}
                          href={`/${locale}/marches/${asset.slug}`}
                          className={itemClassName}
                        >
                          {content}
                        </Link>
                      ) : (
                        <span key={asset.id} className={itemClassName}>
                          {content}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-label={
                isPaused
                  ? isFrench
                    ? 'Reprendre le défilement des marchés'
                    : 'Resume market ticker'
                  : isFrench
                    ? 'Mettre en pause le défilement des marchés'
                    : 'Pause market ticker'
              }
              aria-pressed={isPaused}
              onClick={() => setIsPaused((paused) => !paused)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          </>
        ) : loading ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground">
            <Radio className="h-3.5 w-3.5 animate-pulse text-primary" />
            <span>{isFrench ? 'Chargement des cotations…' : 'Loading market quotes…'}</span>
          </div>
        ) : (
          <p className="min-w-0 flex-1 text-xs text-muted-foreground">
            {isFrench ? 'Cours momentanément indisponibles' : 'Quotes temporarily unavailable'}
          </p>
        )}
      </div>
    </div>
  );
}
