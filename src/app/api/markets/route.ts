import { NextResponse } from 'next/server';
import { getMarketSnapshot } from '@/lib/market-data';

export async function GET() {
  try {
    const snapshot = await getMarketSnapshot();
    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'public, s-maxage=2, stale-while-revalidate=2',
      },
    });
  } catch (error) {
    console.error('Market data request failed:', error);
    return NextResponse.json(
      { error: 'Market data is temporarily unavailable. Please try again shortly.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
