import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import MarketDashboard from '@/components/MarketDashboard';
import { MARKET_ASSETS } from '@/lib/market-config';
import { getLocalizedPageMetadata } from '@/lib/page-metadata';
import { SITE_NAME, SITE_URL } from '@/lib/site-legal';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; asset: string }>;
}): Promise<Metadata> {
  const { locale, asset: slug } = await params;
  const asset = MARKET_ASSETS.find((item) => item.slug === slug);
  if (!asset) return {};

  const name = locale === 'fr' ? asset.frenchName : asset.name;
  const isFrench = locale === 'fr';
  const title =
    asset.type === 'crypto'
      ? isFrench
        ? `${asset.symbol} en direct : cours ${asset.symbol}/USD & ${asset.symbol}/USDT`
        : `${asset.symbol} Live Price: ${asset.symbol}/USD & ${asset.symbol}/USDT`
      : isFrench
        ? 'Cours de l’or (XAU/USD) en direct'
        : 'Gold price (XAU/USD) live';
  const description =
    asset.type === 'crypto'
      ? isFrench
        ? `Cours de ${name} (${asset.symbol}) : prix ${asset.symbol}/USD et ${asset.symbol}/USDT, variation 24 h en direct, graphique et sources Binance et CoinGecko.`
        : `${name} (${asset.symbol}) price: ${asset.symbol}/USD and ${asset.symbol}/USDT, live 24-hour change, chart and Binance and CoinGecko sources.`
      : isFrench
        ? 'Cours de l’or (XAU/USD) en direct, graphique de marché et source des cotations.'
        : 'Live gold (XAU/USD) price, market chart and quote source.';
  return {
    ...getLocalizedPageMetadata(
    locale,
    `/marches/${slug}`,
      title,
      description,
    ),
    keywords:
      asset.type === 'crypto'
        ? [
            `${asset.symbol}/USD`,
            `${asset.symbol} USD`,
            `${asset.symbol}/USDT`,
            `${asset.symbol} USDT`,
            `${name} ${isFrench ? 'cours en direct' : 'live price'}`,
            `${asset.symbol} Binance`,
            `${asset.symbol} CoinGecko`,
          ]
        : ['XAU/USD', 'gold price live', 'cours de l’or en direct'],
  };
}

export default async function MarketAssetPage({
  params,
}: {
  params: Promise<{ locale: string; asset: string }>;
}) {
  const { locale, asset: slug } = await params;
  const asset = MARKET_ASSETS.find((item) => item.slug === slug);
  if (!asset) notFound();

  const isFrench = locale === 'fr';
  const name = isFrench ? asset.frenchName : asset.name;
  const description =
    asset.type === 'crypto'
      ? isFrench
        ? `Cours de ${name} (${asset.symbol}) : prix ${asset.symbol}/USD et ${asset.symbol}/USDT, variation 24 h en direct, graphique et sources Binance et CoinGecko.`
        : `${name} (${asset.symbol}) price: ${asset.symbol}/USD and ${asset.symbol}/USDT, live 24-hour change, chart and Binance and CoinGecko sources.`
      : isFrench
        ? 'Cours de l’or (XAU/USD) en direct, graphique de marché et source des cotations.'
        : 'Live gold (XAU/USD) price, market chart and quote source.';
  const sourceUrls =
    asset.type === 'crypto'
      ? [
          `https://www.binance.com/en/trade/${asset.symbol}_USDT`,
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${asset.symbol}USDT`,
          `https://www.coingecko.com/en/coins/${asset.id}`,
        ]
      : ['https://api.gold-api.com/price/XAU'];
  const pageUrl = `${SITE_URL}/${locale}/marches/${asset.slug}`;
  const dataset = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name:
      asset.type === 'crypto'
        ? `${asset.symbol} price in USD and USDT | ${SITE_NAME}`
        : `${asset.symbol} spot price in USD | ${SITE_NAME}`,
    description,
    url: pageUrl,
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    isBasedOn: sourceUrls,
    distribution: {
      '@type': 'DataDownload',
      contentUrl: `${SITE_URL}/api/markets`,
      encodingFormat: 'application/json',
    },
    temporalResolution: 'PT2S',
    variableMeasured:
      asset.type === 'crypto'
        ? [
            `${asset.symbol}/USD reference price`,
            `${asset.symbol}/USDT spot price`,
            '24-hour price change',
          ]
        : ['XAU/USD spot price'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(dataset).replace(/</g, '\\u003c'),
        }}
      />
      <MarketDashboard locale={locale} selectedSlug={asset.slug} />
    </>
  );
}
