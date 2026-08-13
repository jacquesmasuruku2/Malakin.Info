import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_STATION } from '../route';

export async function GET() {
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

    return NextResponse.json(
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
    );
  } catch (error) {
    console.error('[radio API] Error fetching active station:', error);
    return NextResponse.json(
      {
        ...DEFAULT_STATION,
        currentProgram: null,
      },
      { status: 200 },
    );
  }
}
