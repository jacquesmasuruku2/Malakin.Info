import { NextRequest, NextResponse } from 'next/server';
import { resolveCurrentUserId } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseSubscription(value: unknown) {
  if (!isRecord(value) || typeof value.endpoint !== 'string') return null;
  if (
    typeof value.keys !== 'object' ||
    value.keys === null ||
    !('p256dh' in value.keys) ||
    !('auth' in value.keys)
  ) {
    return null;
  }

  const p256dh = value.keys.p256dh;
  const auth = value.keys.auth;
  if (
    value.endpoint.length > 4096 ||
    typeof p256dh !== 'string' ||
    !/^[A-Za-z0-9_-]{20,200}$/.test(p256dh) ||
    typeof auth !== 'string' ||
    !/^[A-Za-z0-9_-]{8,100}$/.test(auth)
  ) {
    return null;
  }

  try {
    const endpointUrl = new URL(value.endpoint);
    const supportedPushHost =
      endpointUrl.hostname === 'fcm.googleapis.com' ||
      endpointUrl.hostname === 'web.push.apple.com' ||
      endpointUrl.hostname.endsWith('.push.services.mozilla.com') ||
      endpointUrl.hostname.endsWith('.notify.windows.com');
    if (
      endpointUrl.protocol !== 'https:' ||
      endpointUrl.username ||
      endpointUrl.password ||
      (endpointUrl.port && endpointUrl.port !== '443') ||
      !supportedPushHost
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return { endpoint: value.endpoint, p256dh, auth };
}

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
    }

    const subscription = parseSubscription(await request.json());
    if (!subscription) {
      return NextResponse.json({ error: 'Abonnement Push invalide.' }, { status: 400 });
    }

    await prisma.webPushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      create: { userId, ...subscription },
      update: { userId, p256dh: subscription.p256dh, auth: subscription.auth },
    });
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error('Unable to save Web Push subscription:', error);
    return NextResponse.json({ error: 'Impossible d’enregistrer les notifications sur cet appareil.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
    }

    const body: unknown = await request.json();
    if (!isRecord(body) || typeof body.endpoint !== 'string') {
      return NextResponse.json({ error: 'Abonnement Push invalide.' }, { status: 400 });
    }

    await prisma.webPushSubscription.deleteMany({
      where: { userId, endpoint: body.endpoint },
    });
    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error('Unable to remove Web Push subscription:', error);
    return NextResponse.json({ error: 'Impossible de désactiver les notifications sur cet appareil.' }, { status: 500 });
  }
}
