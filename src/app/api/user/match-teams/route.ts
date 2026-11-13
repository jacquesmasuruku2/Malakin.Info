import { NextRequest, NextResponse } from 'next/server';
import { resolveCurrentUserId } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseTeam(value: unknown) {
  if (!isRecord(value)) return null;
  const espnTeamId = typeof value.espnTeamId === 'string' ? value.espnTeamId.trim() : '';
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  if (!/^\d{1,20}$/.test(espnTeamId) || !name || name.length > 120) return null;

  let logo: string | null = null;
  if (value.logo !== null && value.logo !== undefined) {
    if (typeof value.logo !== 'string' || value.logo.length > 2048) return null;
    try {
      const logoUrl = new URL(value.logo);
      if (logoUrl.protocol !== 'https:') return null;
      logo = logoUrl.toString();
    } catch {
      return null;
    }
  }

  return { espnTeamId, name, logo };
}

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
    }

    const teams = await prisma.followedFootballTeam.findMany({
      where: { userId },
      select: { espnTeamId: true, name: true, logo: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Unable to load followed football teams:', error);
    return NextResponse.json({ error: 'Impossible de charger les équipes suivies.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
    }

    const body: unknown = await request.json();
    const team = parseTeam(body);
    if (!team) {
      return NextResponse.json({ error: 'Les informations de l’équipe sont invalides.' }, { status: 400 });
    }

    const followedTeam = await prisma.followedFootballTeam.upsert({
      where: {
        userId_espnTeamId: { userId, espnTeamId: team.espnTeamId },
      },
      create: { userId, ...team },
      update: { name: team.name, logo: team.logo },
      select: { espnTeamId: true, name: true, logo: true },
    });
    return NextResponse.json({ team: followedTeam });
  } catch (error) {
    console.error('Unable to follow football team:', error);
    return NextResponse.json({ error: 'Impossible d’enregistrer cette équipe.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
    }

    const espnTeamId = request.nextUrl.searchParams.get('teamId')?.trim() ?? '';
    if (!/^\d{1,20}$/.test(espnTeamId)) {
      return NextResponse.json({ error: 'Identifiant d’équipe invalide.' }, { status: 400 });
    }

    await prisma.followedFootballTeam.deleteMany({ where: { userId, espnTeamId } });
    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error('Unable to unfollow football team:', error);
    return NextResponse.json({ error: 'Impossible de retirer cette équipe des favoris.' }, { status: 500 });
  }
}
