import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const program = await prisma.radioProgram.findUnique({ where: { id } });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    return NextResponse.json(program, { status: 200 });
  } catch (error) {
    console.error('[radio programs API] Error fetching program:', error);
    return NextResponse.json({ error: 'Unable to fetch radio program.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const program = await prisma.radioProgram.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        slug: body.slug ?? undefined,
        host: body.host ?? undefined,
        description: body.description ?? undefined,
        streamUrl: body.streamUrl ?? undefined,
        imageUrl: body.imageUrl ?? undefined,
        startTime: body.startTime ? new Date(body.startTime) : undefined,
        endTime: body.endTime ? new Date(body.endTime) : undefined,
        isLive: body.isLive ?? undefined,
        isFeatured: body.isFeatured ?? undefined,
      },
    });

    return NextResponse.json(program, { status: 200 });
  } catch (error) {
    console.error('[radio programs API] Error updating program:', error);
    return NextResponse.json({ error: 'Unable to update radio program.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.radioProgram.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[radio programs API] Error deleting program:', error);
    return NextResponse.json({ error: 'Unable to delete radio program.' }, { status: 500 });
  }
}
