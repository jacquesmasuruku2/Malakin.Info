import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { revalidatePublicArticle } from '@/lib/revalidate-site';

export async function GET(request: NextRequest) {
  const { response: authResponse } = await requireAdmin();
  if (authResponse) return authResponse;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const partnerships = await prisma.partnership.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(partnerships);
  } catch (error) {
    console.error('Error fetching partnership requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partnership requests', partnerships: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { response: authResponse } = await requireAdmin();
  if (authResponse) return authResponse;

  try {
    const body = await request.json();
    const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : '';
    const contactName = typeof body.contactName === 'string' ? body.contactName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const type = typeof body.type === 'string' ? body.type.trim() : '';
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
    const websiteUrl = typeof body.websiteUrl === 'string' ? body.websiteUrl.trim() : '';

    if (!companyName || !contactName || !email || !type || !imageUrl) {
      return NextResponse.json(
        { error: 'Le nom, le contact, l’e-mail, le type et le logo sont requis.' },
        { status: 400 },
      );
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
    }

    try {
      if (new URL(imageUrl).protocol !== 'https:') throw new Error('Logo must use HTTPS');
    } catch {
      return NextResponse.json({ error: 'Le logo doit être une URL publique HTTPS.' }, { status: 400 });
    }

    if (websiteUrl) {
      try {
        const parsedWebsiteUrl = new URL(websiteUrl);
        if (!['http:', 'https:'].includes(parsedWebsiteUrl.protocol)) throw new Error('Invalid protocol');
      } catch {
        return NextResponse.json({ error: 'URL du site partenaire invalide.' }, { status: 400 });
      }
    }

    const partnership = await prisma.partnership.create({
      data: {
        companyName,
        contactName,
        email,
        phone: typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : null,
        type,
        description: typeof body.description === 'string' && body.description.trim()
          ? body.description.trim()
          : null,
        imageUrl,
        websiteUrl: websiteUrl || null,
        status: 'approved',
      },
    });

    await revalidatePublicArticle({ paths: ['/fr', '/en'] });
    return NextResponse.json(partnership, { status: 201 });
  } catch (error) {
    console.error('Error creating footer partner:', error);
    return NextResponse.json({ error: 'Impossible de publier le partenaire.' }, { status: 500 });
  }
}
