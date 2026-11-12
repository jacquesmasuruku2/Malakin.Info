import LiveScores from '@/components/LiveScores';
import { getLocalizedPageMetadata } from '@/lib/page-metadata';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const english = locale === 'en';

  return getLocalizedPageMetadata(
    locale,
    '/matches-en-direct',
    english ? 'Live football matches' : 'Matches en direct',
    english
      ? 'Live football matches and scores from competitions covered by MalakInfo.'
      : 'Suivez les matches de football en direct et leurs scores sur MalakInfo.',
  );
}

export default async function LiveMatchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LiveScores locale={locale} />;
}
