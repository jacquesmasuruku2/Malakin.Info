import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { processNextTranslationJob } from '@/lib/translation/jobs';

export const maxDuration = 180;

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!expected || !provided) return false;

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return expectedBuffer.length === providedBuffer.length
    && timingSafeEqual(expectedBuffer, providedBuffer);
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured.' }, { status: 503 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const result = await processNextTranslationJob();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[translation worker]', error);
    return NextResponse.json({ error: 'Failed to process a translation job.' }, { status: 500 });
  }
}
