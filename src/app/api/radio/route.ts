import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to add CORS headers
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'https://dashboard.malakinfo.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return cors(response);
}

const DEFAULT_STATION = {
  name: 'Malakinfo Radio',
  streamUrl: 'https://stream.zeno.fm/5k7n5xq7z4zuv',
  logoUrl: '/images/logo.png',
  description: 'Le son de Malakinfo en direct',
  showLabel: true,
  isActive: true,
};

export async function GET() {
  try {
    console.log('[radio API] GET request received');
    const station = await prisma.radioStation.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    console.log('[radio API] Station found:', !!station);

    return cors(NextResponse.json(station ?? DEFAULT_STATION, { status: 200 }));
  } catch (error) {
    console.error('[radio API] Error fetching station:', error);
    console.error('[radio API] Error details:', error instanceof Error ? error.message : String(error));
    return cors(NextResponse.json(DEFAULT_STATION, { status: 200 }));
  }
}

export async function POST(request: Request) {
  try {
    console.log('[radio API] POST request received');
    const body = await request.json();
    console.log('[radio API] Request body:', body);

    if (!body?.streamUrl) {
      console.warn('[radio API] Missing streamUrl');
      return cors(NextResponse.json({ error: 'Le flux radio est requis.' }, { status: 400 }));
    }

    const payload = {
      name: body.name || DEFAULT_STATION.name,
      streamUrl: body.streamUrl,
      logoUrl: body.logoUrl || DEFAULT_STATION.logoUrl,
      description: body.description || DEFAULT_STATION.description,
      showLabel: body.showLabel ?? DEFAULT_STATION.showLabel,
      isActive: body.isActive ?? DEFAULT_STATION.isActive,
    };
    console.log('[radio API] Payload:', payload);

    if (body.id) {
      console.log('[radio API] Updating existing station:', body.id);
      const station = await prisma.radioStation.update({
        where: { id: String(body.id) },
        data: payload,
      });
      console.log('[radio API] Station updated:', station.id);

      return cors(NextResponse.json(station, { status: 200 }));
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

    return cors(NextResponse.json(station, { status: 201 }));
  } catch (error) {
    console.error('[radio API] Error saving station:', error);
    console.error('[radio API] Error details:', error instanceof Error ? error.message : String(error));
    console.error('[radio API] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return cors(NextResponse.json(
      { error: 'Impossible de sauvegarder la radio.' },
      { status: 500 }
    ));
  }
}
