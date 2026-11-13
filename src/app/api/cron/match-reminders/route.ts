import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const maxDuration = 60;

const ESPN_SCHEDULE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams';
const SCHEDULE_CACHE_SECONDS = 60;
const REMINDER_WINDOW_MINUTES = { earliest: 25, latest: 35 };
const TEAM_FETCH_BATCH_SIZE = 8;

type UpcomingMatch = {
  id: string;
  kickoffAt: Date;
  league: string;
  home: { id: string; name: string };
  away: { id: string; name: string };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isSafeInteger(value)) return String(value);
  return null;
}

function parseUpcomingMatch(value: unknown): UpcomingMatch | null {
  if (!isRecord(value)) return null;
  const eventId = getString(value.id);
  const date = getString(value.date);
  const competitions = Array.isArray(value.competitions) ? value.competitions : [];
  const competition = competitions.find(isRecord);
  if (!eventId || !date || !competition) return null;

  const kickoffAt = new Date(date);
  if (!Number.isFinite(kickoffAt.getTime())) return null;
  const status = isRecord(competition.status)
    ? competition.status
    : isRecord(value.status)
      ? value.status
      : null;
  const statusType = status && isRecord(status.type) ? status.type : null;
  if (getString(statusType?.state) !== 'pre') return null;

  const competitors = Array.isArray(competition.competitors)
    ? competition.competitors.filter(isRecord)
    : [];
  const homeSource = competitors.find((competitor) => competitor.homeAway === 'home');
  const awaySource = competitors.find((competitor) => competitor.homeAway === 'away');
  const home = homeSource && isRecord(homeSource.team) ? homeSource.team : null;
  const away = awaySource && isRecord(awaySource.team) ? awaySource.team : null;
  const homeId = home && getString(home.id);
  const awayId = away && getString(away.id);
  const homeName = home && getString(home.displayName ?? home.name);
  const awayName = away && getString(away.displayName ?? away.name);
  if (!homeId || !awayId || !homeName || !awayName) return null;

  const league = isRecord(value.league) ? getString(value.league.name) : null;
  return {
    id: eventId,
    kickoffAt,
    league: league ?? 'Football',
    home: { id: homeId, name: homeName },
    away: { id: awayId, name: awayName },
  };
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!secret || !provided) return false;

  const expectedBuffer = Buffer.from(secret);
  const providedBuffer = Buffer.from(provided);
  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

function isUniqueConstraintError(error: unknown): boolean {
  return isRecord(error) && error.code === 'P2002';
}

async function fetchTeamSchedule(teamId: string): Promise<unknown[]> {
  const response = await fetch(`${ESPN_SCHEDULE_URL}/${encodeURIComponent(teamId)}/schedule`, {
    cache: 'force-cache',
    next: { revalidate: SCHEDULE_CACHE_SECONDS },
    signal: AbortSignal.timeout(15_000),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`ESPN team schedule returned HTTP ${response.status} for team ${teamId}.`);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.events)) {
    throw new Error(`ESPN returned an invalid schedule for team ${teamId}.`);
  }
  return payload.events;
}

async function claimReminder(userId: string, match: UpcomingMatch, now: Date): Promise<boolean> {
  const existing = await prisma.matchReminderDelivery.findUnique({
    where: { userId_espnEventId: { userId, espnEventId: match.id } },
  });
  if (existing?.sentAt) return false;

  const staleClaimBefore = new Date(now.getTime() - 10 * 60 * 1000);
  if (existing?.claimedAt && existing.claimedAt > staleClaimBefore) return false;

  if (existing) {
    const claimed = await prisma.matchReminderDelivery.updateMany({
      where: {
        id: existing.id,
        sentAt: null,
        claimedAt: existing.claimedAt,
      },
      data: { claimedAt: now, kickoffAt: match.kickoffAt },
    });
    return claimed.count === 1;
  }

  try {
    await prisma.matchReminderDelivery.create({
      data: {
        userId,
        espnEventId: match.id,
        kickoffAt: match.kickoffAt,
        claimedAt: now,
      },
    });
    return true;
  } catch (error) {
    if (isUniqueConstraintError(error)) return false;
    throw error;
  }
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured.' }, { status: 503 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.WEB_PUSH_SUBJECT;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return NextResponse.json({ error: 'Web Push VAPID settings are incomplete.' }, { status: 503 });
  }

  try {
    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const followedTeams = await prisma.followedFootballTeam.findMany({
      include: {
        user: {
          select: {
            id: true,
            preferences: { select: { locale: true } },
            webPushSubscriptions: {
              select: { id: true, endpoint: true, p256dh: true, auth: true },
            },
          },
        },
      },
    });
    const uniqueTeamIds = Array.from(new Set(followedTeams.map((team) => team.espnTeamId)));
    const schedules: unknown[] = [];
    let scheduleFailures = 0;

    for (let index = 0; index < uniqueTeamIds.length; index += TEAM_FETCH_BATCH_SIZE) {
      const batch = uniqueTeamIds.slice(index, index + TEAM_FETCH_BATCH_SIZE);
      const results = await Promise.allSettled(batch.map(fetchTeamSchedule));
      for (const result of results) {
        if (result.status === 'fulfilled') {
          schedules.push(...result.value);
        } else {
          scheduleFailures += 1;
          console.error('Unable to fetch an ESPN team schedule:', result.reason);
        }
      }
    }

    if (uniqueTeamIds.length > 0 && scheduleFailures === uniqueTeamIds.length) {
      return NextResponse.json(
        { error: 'All ESPN team schedules failed.', scheduleFailures },
        { status: 502 },
      );
    }

    const matchesById = new Map<string, UpcomingMatch>();
    for (const value of schedules) {
      const match = parseUpcomingMatch(value);
      if (match) matchesById.set(match.id, match);
    }

    const now = new Date();
    const earliestKickoff = now.getTime() + REMINDER_WINDOW_MINUTES.earliest * 60 * 1000;
    const latestKickoff = now.getTime() + REMINDER_WINDOW_MINUTES.latest * 60 * 1000;
    const dueMatches = Array.from(matchesById.values()).filter(
      (match) =>
        match.kickoffAt.getTime() > earliestKickoff &&
        match.kickoffAt.getTime() <= latestKickoff,
    );
    let notificationsSent = 0;
    let deliveryFailures = 0;

    for (const match of dueMatches) {
      const participants = new Set([match.home.id, match.away.id]);
      const userTeams = new Map<string, (typeof followedTeams)[number]>();
      for (const team of followedTeams) {
        if (participants.has(team.espnTeamId)) userTeams.set(team.userId, team);
      }

      const notifiedUsers = new Set<string>();
      for (const followedTeam of userTeams.values()) {
        const user = followedTeam.user;
        if (notifiedUsers.has(user.id)) continue;
        notifiedUsers.add(user.id);
        if (user.webPushSubscriptions.length === 0) continue;

        const claimAt = new Date();
        if (!(await claimReminder(user.id, match, claimAt))) continue;

        const locale = user.preferences?.locale === 'en' ? 'en' : 'fr';
        const title =
          locale === 'en' ? 'Match starts in 30 minutes' : 'Match dans 30 minutes';
        const body = `${match.home.name} – ${match.away.name} · ${match.league}`;
        const payload = JSON.stringify({
          title: `MalakInfo · ${title}`,
          body,
          icon: '/images/logo.png',
          tag: `malakinfo-match-${match.id}`,
          url: `/${locale}/matches-en-direct`,
        });

        const results = await Promise.all(
          user.webPushSubscriptions.map(async (subscription) => {
            try {
              await webPush.sendNotification(
                {
                  endpoint: subscription.endpoint,
                  keys: { p256dh: subscription.p256dh, auth: subscription.auth },
                },
                payload,
                { TTL: 60 * 60 },
              );
              return true;
            } catch (error) {
              const statusCode =
                isRecord(error) && typeof error.statusCode === 'number'
                  ? error.statusCode
                  : null;
              if (statusCode === 404 || statusCode === 410) {
                await prisma.webPushSubscription.deleteMany({
                  where: { id: subscription.id },
                });
              } else {
                console.error('Unable to send a football match reminder:', error);
              }
              return false;
            }
          }),
        );

        if (results.some(Boolean)) {
          await prisma.matchReminderDelivery.update({
            where: {
              userId_espnEventId: { userId: user.id, espnEventId: match.id },
            },
            data: { sentAt: new Date(), claimedAt: null },
          });
          notificationsSent += 1;
        } else {
          await prisma.matchReminderDelivery.updateMany({
            where: {
              userId: user.id,
              espnEventId: match.id,
              claimedAt: claimAt,
              sentAt: null,
            },
            data: { claimedAt: null },
          });
          deliveryFailures += 1;
        }
      }
    }

    return NextResponse.json({
      teamsChecked: uniqueTeamIds.length,
      eventsChecked: matchesById.size,
      dueMatches: dueMatches.length,
      notificationsSent,
      scheduleFailures,
      deliveryFailures,
    });
  } catch (error) {
    console.error('Football match reminder cron failed:', error);
    return NextResponse.json({ error: 'Failed to send football match reminders.' }, { status: 500 });
  }
}
