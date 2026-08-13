import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to add CORS headers
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'https://dashboard.malakinfo.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }));
}

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      include: {
        category: true,
        author: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    // Convert BigInt to number for JSON serialization
    const serializedArticles = articles.map((article: any) => ({
      ...article,
      views: Number(article.views),
    }));

    return cors(NextResponse.json(serializedArticles));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return cors(NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    ));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const article = await prisma.article.create({
      data: body,
      include: {
        category: true,
        author: true,
      },
    });

    return cors(NextResponse.json(article));
  } catch (error) {
    console.error('Error creating article:', error);
    return cors(NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    ));
  }
}
