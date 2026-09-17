import { NextResponse } from 'next/server';
import { applyCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';

function cors(response: NextResponse, request?: Request) {
  return applyCors(response, request);
}

export async function OPTIONS(request: Request) {
  return cors(new NextResponse(null, { status: 204 }), request);
}

export async function GET(request: Request) {
  try {
    const now = new Date();
    const showAll = new URL(request.url).searchParams.get('all') === 'true';
    const programs = await prisma.radioProgram.findMany({
      where: showAll ? undefined : {
        OR: [
          { isLive: true },
          { startTime: { gte: now } },
          { endTime: { gte: now } },
        ],
      },
      orderBy: [
        { isLive: 'desc' },
        { startTime: 'asc' },
      ],
    });

    return cors(NextResponse.json(programs, { status: 200 }), request);
  } catch (error) {
    console.error('[radio programs API] Error fetching programs:', error);
    return cors(NextResponse.json([], { status: 200 }), request);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const payload = {
      stationId: body.stationId ?? null,
      title: String(body.title ?? '').trim(),
      slug: String(body.slug ?? '').trim(),
      host: body.host ? String(body.host).trim() : null,
      description: body.description ? String(body.description).trim() : null,
      streamUrl: body.streamUrl ? String(body.streamUrl).trim() : null,
      imageUrl: body.imageUrl ? String(body.imageUrl).trim() : null,
      startTime: new Date(body.startTime),
      endTime: body.endTime ? new Date(body.endTime) : null,
      isLive: Boolean(body.isLive),
      isFeatured: Boolean(body.isFeatured),
    };

    if (!payload.title || !payload.slug || Number.isNaN(payload.startTime.getTime())) {
      return cors(NextResponse.json({ error: 'Missing required fields.' }, { status: 400 }), request);
    }

    const program = await prisma.radioProgram.create({ data: payload });
    return cors(NextResponse.json(program, { status: 201 }), request);
  } catch (error) {
    console.error('[radio programs API] Error creating program:', error);
    return cors(NextResponse.json({ error: 'Unable to create radio program.' }, { status: 500 }), request);
  }
}
