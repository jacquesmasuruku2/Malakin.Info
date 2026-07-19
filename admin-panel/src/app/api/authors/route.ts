import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(authors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const author = await prisma.author.create({
      data: {
        name: body.name,
        slug: body.slug,
        bio: body.bio,
        role: body.role,
        email: body.email,
        imageUrl: body.imageUrl,
        imageAlt: body.imageAlt,
      },
    });
    return NextResponse.json(author, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 });
  }
}
