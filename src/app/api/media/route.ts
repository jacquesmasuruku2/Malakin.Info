import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'https://dashboard.malakinfo.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
      include: { category: true, author: true },
    });
    return cors(NextResponse.json(media.map((item) => ({ ...item, duration: item.duration ? Number(item.duration) : null }))));
  } catch (error) {
    console.error('Media API error:', error);
    return cors(NextResponse.json({ error: 'Impossible de charger les médias.' }, { status: 500 }));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    const slug = String(body.slug || '').trim();
    const url = String(body.url || '').trim();
    if (!title || !slug || !url || !/^https?:\/\//i.test(url)) {
      return cors(NextResponse.json({ error: 'Titre, slug et URL audio HTTPS requis.' }, { status: 400 }));
    }

    const media = await prisma.media.create({
      data: {
        type: body.type || 'SONG',
        title,
        slug,
        description: body.description ? String(body.description).trim() : null,
        url,
        thumbnailUrl: body.thumbnailUrl ? String(body.thumbnailUrl).trim() : null,
        duration: body.duration ? BigInt(Math.max(0, Number(body.duration))) : null,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
        featured: Boolean(body.featured),
      },
    });
    return cors(NextResponse.json({ ...media, duration: media.duration ? Number(media.duration) : null }, { status: 201 }));
  } catch (error) {
    console.error('Media creation error:', error);
    return cors(NextResponse.json({ error: 'Impossible de publier ce média.' }, { status: 500 }));
  }
}