import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LiveScores from '@/components/LiveScores';

type MatchDetailsTab = 'lineups' | 'statistics' | 'standings';

const SECTION_TABS: Record<string, MatchDetailsTab> = {
  composition: 'lineups',
  lineups: 'lineups',
  statistiques: 'statistics',
  statistics: 'statistics',
  classement: 'standings',
  standings: 'standings',
};

function getMatchId(matchKey: string): number | null {
  const match = /(?:^|[-_])(\d+)$/.exec(matchKey);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function getMatchLabel(matchKey: string, matchId: number): string {
  const slug = matchKey.replace(/[-_]\d+$/, '').replace(/[-_]+$/, '');
  if (!slug || /^\d+$/.test(slug)) return `Match ${matchId}`;
  return slug
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getDetailsTitle(locale: string, label: string, section: string): string {
  const english = locale === 'en';
  if (SECTION_TABS[section] === 'lineups') {
    return english ? `Lineups · ${label}` : `Composition · ${label}`;
  }
  if (SECTION_TABS[section] === 'statistics') {
    return english ? `Statistics · ${label}` : `Statistiques · ${label}`;
  }
  return english ? `Standings · ${label}` : `Classement · ${label}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; matchKey: string; section: string }>;
}): Promise<Metadata> {
  const { locale, matchKey, section } = await params;
  const matchId = getMatchId(matchKey);
  if (!matchId || !SECTION_TABS[section]) return {};

  const label = getMatchLabel(matchKey, matchId);
  return {
    title: getDetailsTitle(locale, label, section),
    description:
      SECTION_TABS[section] === 'lineups'
        ? locale === 'en'
          ? `Official lineups for ${label}, updated as soon as they are announced.`
          : `Composition officielle de ${label}, actualisée dès sa publication.`
        : SECTION_TABS[section] === 'statistics'
          ? locale === 'en'
            ? `Match statistics for ${label}.`
            : `Statistiques du match ${label}.`
          : locale === 'en'
            ? `Competition standings for ${label}.`
            : `Classement de la compétition pour ${label}.`,
  };
}

export default async function SharedMatchDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; matchKey: string; section: string }>;
}) {
  const { locale, matchKey, section } = await params;
  const matchId = getMatchId(matchKey);
  const detailsTab = SECTION_TABS[section];
  if (!matchId || !detailsTab) notFound();

  return (
    <LiveScores
      locale={locale}
      initialMatchId={matchId}
      initialDetailsTab={detailsTab}
      initialMatchLabel={getMatchLabel(matchKey, matchId)}
      initialMatchKey={matchKey}
    />
  );
}
