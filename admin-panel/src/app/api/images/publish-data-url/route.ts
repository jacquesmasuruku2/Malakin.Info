import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensurePublicImageUrl, isDataImageUrl } from '@/lib/r2';

/** Convert a base64 data URL into a public Cloudflare HTTPS URL (and optionally persist on an article). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dataUrl = typeof body?.dataUrl === 'string' ? body.dataUrl : '';
    const articleId = typeof body?.articleId === 'string' ? body.articleId : null;

    if (!isDataImageUrl(dataUrl)) {
      return NextResponse.json(
        { error: 'dataUrl doit être une image data:image/...;base64,...' },
        { status: 400 },
      );
    }

    const url = await ensurePublicImageUrl(dataUrl, 'Images_blogs');
    if (!url || url.startsWith('data:')) {
      return NextResponse.json(
        {
          error:
            'Impossible de publier l’image sur Cloudflare. Vérifiez les variables R2 sur le panel.',
        },
        { status: 500 },
      );
    }

    if (articleId) {
      await prisma.article.update({
        where: { id: articleId },
        data: { mainImageUrl: url },
      });
    }

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('[publish-data-url]', error);
    return NextResponse.json(
      {
        error: 'Échec de publication de l’image',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
