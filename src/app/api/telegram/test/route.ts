import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET() {
  const result = await sendTelegramMessage('Test de notification Telegram depuis MalakInfo.');
  return NextResponse.json({ result });
}
