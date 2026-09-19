import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePublicAuthor } from '@/lib/revalidate-site';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }
    return NextResponse.json(author);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch author' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const author = await prisma.author.update({
      where: { id },
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
    await revalidatePublicAuthor(author.slug);
    return NextResponse.json(author);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update author' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.author.findUnique({
      where: { id },
      select: { slug: true },
    });
    await prisma.author.delete({
      where: { id },
    });
    await revalidatePublicAuthor(existing?.slug);
    return NextResponse.json({ message: 'Author deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 });
  }
}
