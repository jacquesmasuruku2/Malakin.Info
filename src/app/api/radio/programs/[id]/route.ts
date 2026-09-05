import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function cors(response: NextResponse, request?: Request) {
  const origin = request?.headers.get('origin');
  const allowed = [process.env.ADMIN_PANEL_URL, process.env.NEXT_PUBLIC_ADMIN_URL, 'https://dashboard.malakinfo.com', 'http://localhost:3001', 'http://localhost:3000'].filter(Boolean);
  if (origin && allowed.includes(origin)) response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
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
