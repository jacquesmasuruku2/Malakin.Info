import type { Metadata } from 'next';
import MarketDashboard from '@/components/MarketDashboard';
import { getLocalizedPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFrench = locale === 'fr';

  return getLocalizedPageMetadata(
    locale,
    '/marches',
    isFrench ? 'Marchés financiers en direct' : 'Live financial markets',
    isFrench
      ? 'Suivez les cours de l’or et des principales cryptomonnaies en dollars américains.'
      : 'Follow gold and leading cryptocurrency prices in US dollars.',
  );
}

export default async function MarketsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <MarketDashboard locale={locale} />;
}
