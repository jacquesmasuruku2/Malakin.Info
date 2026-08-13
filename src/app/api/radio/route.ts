import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const station = await prisma.radioStation.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(station ?? DEFAULT_STATION, { status: 200 });
  } catch (error) {
    console.error('[radio API] Error fetching station:', error);
    return NextResponse.json(DEFAULT_STATION, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.streamUrl) {
      return NextResponse.json({ error: 'Le flux radio est requis.' }, { status: 400 });
    }

    const payload = {
      name: body.name || DEFAULT_STATION.name,
      streamUrl: body.streamUrl,
      logoUrl: body.logoUrl || DEFAULT_STATION.logoUrl,
      description: body.description || DEFAULT_STATION.description,
      showLabel: body.showLabel ?? DEFAULT_STATION.showLabel,
      isActive: body.isActive ?? DEFAULT_STATION.isActive,
    };

    if (body.id) {
      const station = await prisma.radioStation.update({
        where: { id: String(body.id) },
        data: payload,
      });

      return NextResponse.json(station, { status: 200 });
    }

    if (payload.isActive) {
      await prisma.radioStation.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const station = await prisma.radioStation.create({
      data: payload,
    });

    return NextResponse.json(station, { status: 201 });
  } catch (error) {
    console.error('[radio API] Error saving station:', error);
    return NextResponse.json(
      { error: 'Impossible de sauvegarder la radio.' },
      { status: 500 }
    );
  }
}
