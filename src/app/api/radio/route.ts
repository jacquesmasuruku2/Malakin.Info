import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to add CORS headers
function cors(response: NextResponse, request?: Request) {
  const requestOrigin = request?.headers.get('origin');
  const allowedOrigins = [
    process.env.ADMIN_PANEL_URL,
    process.env.NEXT_PUBLIC_ADMIN_URL,
    'https://dashboard.malakinfo.com',
    'http://localhost:3001',
    'http://localhost:3000',
  ].filter(Boolean);
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    response.headers.set('Access-Control-Allow-Origin', requestOrigin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: Request) {
  const response = new NextResponse(null, { status: 200 });
  return cors(response, request);
}

export const DEFAULT_STATION = {
  id: 'malakinfo-radio',
  name: 'Radio MalakInfo',
  streamUrl: '',
  logoUrl: '/images/logo.png',
  description: 'Radio MalakInfo',
  showLabel: true,
  isActive: false,
} as const;

const PLACEHOLDER_STATION_IDS = new Set(['default-radio', 'malakinfo-radio', '']);

export async function GET(request: Request) {
  try {
    const station = await prisma.radioStation.findFirst({
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
    });

    return cors(NextResponse.json(station ?? DEFAULT_STATION, { status: 200 }), request);
  } catch (error) {
    console.error('[radio API] Error fetching station:', error);
    return cors(NextResponse.json(DEFAULT_STATION, { status: 200 }), request);
  }
}

export async function POST(request: Request) {
  try {
    console.log('[radio API] POST request received');
    const body = await request.json();
    console.log('[radio API] Request body:', body);

    const payload = {
      name: String(body?.name ?? '').trim() || DEFAULT_STATION.name,
      streamUrl: String(body?.streamUrl ?? '').trim() || DEFAULT_STATION.streamUrl,
      logoUrl: String(body?.logoUrl ?? '').trim() || DEFAULT_STATION.logoUrl,
      description: String(body?.description ?? '').trim() || DEFAULT_STATION.description,
      showLabel: body?.showLabel ?? DEFAULT_STATION.showLabel,
      isActive: body?.isActive ?? DEFAULT_STATION.isActive,
    };

    if (payload.logoUrl) {
      const isLocalPath = payload.logoUrl.startsWith('/');
      if (!isLocalPath) {
        try {
          const logoUrl = new URL(payload.logoUrl);
          if (!['http:', 'https:'].includes(logoUrl.protocol)) throw new Error('Invalid protocol');
        } catch {
          return cors(NextResponse.json({ error: 'L’URL de l’icône doit être une URL HTTP/HTTPS ou un chemin local.' }, { status: 400 }), request);
        }
      }
    }

    try {
      const streamUrl = new URL(payload.streamUrl);
      if (!['http:', 'https:'].includes(streamUrl.protocol)) throw new Error('Invalid protocol');
    } catch {
      return cors(NextResponse.json({ error: 'L’URL du flux doit être une URL HTTP ou HTTPS valide.' }, { status: 400 }), request);
    }
    console.log('[radio API] Payload:', payload);

    if (body.id && !PLACEHOLDER_STATION_IDS.has(String(body.id))) {
      console.log('[radio API] Updating existing station:', body.id);
      const station = await prisma.$transaction(async (transaction) => {
        if (payload.isActive) {
          await transaction.radioStation.updateMany({ where: { isActive: true, id: { not: String(body.id) } }, data: { isActive: false } });
        }
        return transaction.radioStation.update({ where: { id: String(body.id) }, data: payload });
      });
      console.log('[radio API] Station updated:', station.id);

      return cors(NextResponse.json(station, { status: 200 }), request);
    }

    if (payload.isActive) {
      console.log('[radio API] Deactivating all other stations');
      await prisma.radioStation.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    console.log('[radio API] Creating new station');
    const station = await prisma.radioStation.create({
      data: payload,
    });
    console.log('[radio API] Station created:', station.id);

    return cors(NextResponse.json(station, { status: 201 }), request);
  } catch (error) {
    console.error('[radio API] Error saving station:', error);
    console.error('[radio API] Error details:', error instanceof Error ? error.message : String(error));
    console.error('[radio API] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return cors(NextResponse.json(
      { error: 'Impossible de sauvegarder la radio.' },
      { status: 500 }
    ), request);
  }
}
