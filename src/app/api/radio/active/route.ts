import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_STATION } from '../route';

function cors(response: NextResponse, request?: Request) {
  const origin = request?.headers.get('origin');
  const allowed = [process.env.ADMIN_PANEL_URL, process.env.NEXT_PUBLIC_ADMIN_URL, 'https://dashboard.malakinfo.com', 'http://localhost:3001', 'http://localhost:3000'].filter(Boolean);
  if (origin && allowed.includes(origin)) response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export async function OPTIONS(request: Request) {
  return cors(new NextResponse(null, { status: 204 }), request);
}

export async function GET(request: Request) {
  try {
    const [station, currentProgram] = await Promise.all([
      prisma.radioStation.findFirst({
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.radioProgram.findFirst({
        where: {
          OR: [
            { isLive: true },
            {
              startTime: { lte: new Date() },
              OR: [{ endTime: null }, { endTime: { gte: new Date() } }],
            },
          ],
        },
        orderBy: {
          startTime: 'desc',
        },
      }),
    ]);

    const activeStream = currentProgram?.streamUrl || station?.streamUrl || DEFAULT_STATION.streamUrl;
    const activeName = currentProgram?.title || station?.name || DEFAULT_STATION.name;
    const activeDescription = currentProgram?.description || station?.description || DEFAULT_STATION.description;
    const activeLogo = currentProgram?.imageUrl || station?.logoUrl || DEFAULT_STATION.logoUrl;

    return cors(NextResponse.json(
      {
        ...(station ?? DEFAULT_STATION),
        name: activeName,
        streamUrl: activeStream,
        description: activeDescription,
        logoUrl: activeLogo,
        currentProgram: currentProgram
          ? {
              id: currentProgram.id,
              title: currentProgram.title,
              host: currentProgram.host,
              description: currentProgram.description,
              startTime: currentProgram.startTime,
              endTime: currentProgram.endTime,
              isLive: currentProgram.isLive,
              streamUrl: currentProgram.streamUrl,
              imageUrl: currentProgram.imageUrl,
            }
          : null,
      },
      { status: 200 },
    ), request);
  } catch (error) {
    console.error('[radio API] Error fetching active station:', error);
    return cors(NextResponse.json(
      {
        ...DEFAULT_STATION,
        currentProgram: null,
      },
      { status: 200 },
    ), request);
  }
}
