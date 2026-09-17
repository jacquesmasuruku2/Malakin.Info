import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supportedLocales } from '@/lib/i18n';

function isAuthorized(request: NextRequest) {
  const secret =
    request.headers.get('x-revalidate-secret') ||
    request.nextUrl.searchParams.get('secret') ||
    '';
  const expected = process.env.REVALIDATE_SECRET || process.env.CRON_SECRET;
  return Boolean(expected && secret && secret === expected);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const slug = typeof body.slug === 'string' ? body.slug : '';
    const categorySlug =
      typeof body.categorySlug === 'string' ? body.categorySlug : '';
    const locales: string[] = Array.isArray(body.locales)
      ? body.locales.filter((item: unknown) => typeof item === 'string')
      : [...supportedLocales];

    const paths = new Set<string>(['/']);

    for (const locale of locales) {
      paths.add(`/${locale}`);
      paths.add(`/${locale}/actualites`);
      if (categorySlug) {
        paths.add(`/${locale}/${categorySlug}`);
      }
      if (slug) {
        paths.add(`/${locale}/${slug}`);
        if (categorySlug) {
          paths.add(`/${locale}/${categorySlug}/${slug}`);
          paths.add(`/${locale}/actualites/${slug}`);
          paths.add(`/${locale}/culture/${slug}`);
        }
      }
    }

    if (Array.isArray(body.paths)) {
      for (const path of body.paths) {
        if (typeof path === 'string' && path.startsWith('/')) {
          paths.add(path);
        }
      }
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    // Soft-refresh layouts so listings pull fresh data on next visit.
    revalidatePath('/', 'layout');

    return NextResponse.json({
      revalidated: true,
      paths: [...paths],
      now: Date.now(),
    });
  } catch (error) {
    console.error('[revalidate]', error);
    return NextResponse.json(
      {
        error: 'Revalidation failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
