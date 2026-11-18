import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptchaToken } from '@/lib/recaptcha';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (
    typeof body !== 'object'
    || body === null
    || !('token' in body)
    || typeof body.token !== 'string'
    || !body.token.trim()
  ) {
    return NextResponse.json({ error: 'A reCAPTCHA token is required.' }, { status: 400 });
  }

  const result = await verifyRecaptchaToken(body.token);
  if (result === 'success') {
    return NextResponse.json({ success: true }, { status: 200 });
  }
  if (result === 'not_configured') {
    return NextResponse.json({ error: 'reCAPTCHA is not configured.' }, { status: 503 });
  }
  if (result === 'unavailable') {
    return NextResponse.json({ error: 'reCAPTCHA verification is temporarily unavailable.' }, { status: 502 });
  }

  return NextResponse.json({ error: 'reCAPTCHA verification failed.' }, { status: 400 });
}
