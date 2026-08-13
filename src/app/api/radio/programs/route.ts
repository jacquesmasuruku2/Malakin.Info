import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const programs = await prisma.radioProgram.findMany({
      where: {
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

    return NextResponse.json(programs, { status: 200 });
  } catch (error) {
    console.error('[radio programs API] Error fetching programs:', error);
    return NextResponse.json([], { status: 200 });
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

    if (!payload.title || !payload.slug || !payload.startTime) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const program = await prisma.radioProgram.create({ data: payload });
    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('[radio programs API] Error creating program:', error);
    return NextResponse.json({ error: 'Unable to create radio program.' }, { status: 500 });
  }
}
