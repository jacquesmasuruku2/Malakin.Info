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
    english
      ? 'Live football scores and match results'
      : 'Football en direct : scores et résultats',
    english
      ? 'Follow live football scores, upcoming fixtures, recent results and match highlights on MalakInfo.'
      : 'Suivez les scores de football en direct, les matches à venir, les résultats récents et leurs temps forts sur MalakInfo.',
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
