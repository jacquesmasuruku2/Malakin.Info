import { NextResponse } from 'next/server';
import type { LiveMatchEvent } from '@/types/live-scores';

const API_BASE_URL = 'https://v3.football.api-sports.io/fixtures/events';
const CACHE_SECONDS = 900;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function getPersonName(value: unknown): string | null {
  return isRecord(value) ? nullableString(value.name) : null;
}

function parseEvent(value: unknown): LiveMatchEvent {
  if (
    !isRecord(value) ||
    !isRecord(value.time) ||
    typeof value.time.elapsed !== 'number' ||
    !Number.isFinite(value.time.elapsed) ||
    typeof value.type !== 'string'
  ) {
    throw new Error('API-SPORTS returned an invalid match event.');
  }

  return {
    time: {
      elapsed: value.time.elapsed,
      extra: nullableNumber(value.time.extra),
    },
    team: { name: getPersonName(value.team) },
    player: { name: getPersonName(value.player) },
    assist: { name: getPersonName(value.assist) },
    type: value.type,
    detail: nullableString(value.detail),
    comments: nullableString(value.comments),
  };
}

function hasApiErrors(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return Boolean(value);
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const fixtureId = searchParams.get('fixtureId') ?? searchParams.get('id');

  if (!fixtureId || !/^[1-9]\d*$/.test(fixtureId) || !Number.isSafeInteger(Number(fixtureId))) {
    return NextResponse.json(
      { error: 'A valid fixtureId is required.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const apiKey = process.env.APISPORTS_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'APISPORTS_KEY is not configured.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}?fixture=${encodeURIComponent(fixtureId)}`,
      {
        headers: { 'x-apisports-key': apiKey },
        next: { revalidate: CACHE_SECONDS },
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!response.ok) {
      throw new Error(`API-SPORTS responded with HTTP ${response.status}.`);
    }

    const payload: unknown = await response.json();
    if (
      !isRecord(payload) ||
      hasApiErrors(payload.errors) ||
      !Array.isArray(payload.response)
    ) {
      throw new Error('API-SPORTS returned an invalid match events response.');
    }

    const events = payload.response
      .map(parseEvent)
      .sort(
        (a, b) =>
          a.time.elapsed - b.time.elapsed ||
          (a.time.extra ?? 0) - (b.time.extra ?? 0),
      );

    return NextResponse.json(
      { events },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=900',
        },
      },
    );
  } catch (error) {
    console.error('Match details request failed:', error);
    return NextResponse.json(
      { error: 'Les temps forts sont temporairement indisponibles.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
