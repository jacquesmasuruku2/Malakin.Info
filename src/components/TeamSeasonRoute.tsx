import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import TeamSeasonDetails from '@/components/TeamSeasonDetails';

type RouteProps = {
  params: Promise<{ locale: string; teamKey: string }>;
  searchParams: Promise<{ league?: string | string[]; season?: string | string[] }>;
};

function getTeamId(teamKey: string): number | null {
  const match = /(?:^|[-_])(\d+)$/.exec(teamKey);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function getTeamLabel(teamKey: string): string {
  const slug = teamKey.replace(/[-_]\d+$/, '').replace(/[-_]+$/, '');
  if (!slug) return 'Football team';
  return slug
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateTeamSeasonMetadata({
  params,
}: Pick<RouteProps, 'params'>): Promise<Metadata> {
  const { locale, teamKey } = await params;
  const teamId = getTeamId(teamKey);
  if (!teamId) return {};
  const teamLabel = getTeamLabel(teamKey);
  return {
    title: locale === 'en' ? `${teamLabel} · Team season` : `${teamLabel} · Saison de l’équipe`,
    description:
      locale === 'en'
        ? `Results, upcoming matches, squad and transfers for ${teamLabel}.`
        : `Résultats, matches à venir, effectif et mercato de ${teamLabel}.`,
  };
}

export default async function TeamSeasonRoute({ params, searchParams }: RouteProps) {
  const [{ locale, teamKey }, query] = await Promise.all([params, searchParams]);
  const teamId = getTeamId(teamKey);
  if (!teamId) notFound();

  const leagueValue = Array.isArray(query.league) ? query.league[0] : query.league;
  const seasonValue = Array.isArray(query.season) ? query.season[0] : query.season;
  const initialSeason =
    seasonValue && /^\d{4}$/.test(seasonValue) ? Number(seasonValue) : null;

  return (
    <TeamSeasonDetails
      locale={locale}
      teamId={teamId}
      teamLabel={getTeamLabel(teamKey)}
      leagueSlug={leagueValue ?? null}
      initialSeason={initialSeason}
    />
  );
}
