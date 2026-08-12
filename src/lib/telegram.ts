const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const isTelegramEnabled = Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);

export async function sendTelegramMessage(message: string) {
  if (!isTelegramEnabled) {
    console.warn('Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured.');
    return { success: false, error: 'Telegram not configured' };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        disable_web_page_preview: true,
      }),
    });

    const resultText = await response.text();

    if (!response.ok) {
      console.error('Telegram API error', response.status, resultText);
      return { success: false, status: response.status, error: resultText };
    }

    return { success: true, data: resultText };
  } catch (error) {
    console.error('Telegram notification failed:', error);
    return { success: false, error: String(error) };
  }
}
