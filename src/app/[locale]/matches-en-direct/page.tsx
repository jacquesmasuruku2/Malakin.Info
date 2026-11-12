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
    english ? 'Live and completed football matches' : 'Matches en direct et terminés',
    english
      ? 'Follow live football scores, completed matches and match highlights on MalakInfo.'
      : 'Suivez les scores en direct, les matches terminés et leurs temps forts sur MalakInfo.',
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
