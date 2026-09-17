import { NextResponse } from 'next/server';
import { applyCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';

function cors(response: NextResponse, request?: Request) {
  return applyCors(response, request);
}

export async function OPTIONS(request: Request) {
  return cors(new NextResponse(null, { status: 204 }), request);
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const program = await prisma.radioProgram.findUnique({ where: { id } });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    return cors(NextResponse.json(program, { status: 200 }), _request);
  } catch (error) {
    console.error('[radio programs API] Error fetching program:', error);
    return cors(NextResponse.json({ error: 'Unable to fetch radio program.' }, { status: 500 }), _request);
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
        endTime: body.endTime === null ? null : body.endTime ? new Date(body.endTime) : undefined,
        isLive: body.isLive ?? undefined,
        isFeatured: body.isFeatured ?? undefined,
      },
    });

    return cors(NextResponse.json(program, { status: 200 }), request);
  } catch (error) {
    console.error('[radio programs API] Error updating program:', error);
    return cors(NextResponse.json({ error: 'Unable to update radio program.' }, { status: 500 }), request);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.radioProgram.delete({ where: { id } });
    return cors(NextResponse.json({ success: true }, { status: 200 }), _request);
  } catch (error) {
    console.error('[radio programs API] Error deleting program:', error);
    return cors(NextResponse.json({ error: 'Unable to delete radio program.' }, { status: 500 }), _request);
  }
}
