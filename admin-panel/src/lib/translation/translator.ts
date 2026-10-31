import 'server-only';

const TRANSLATABLE_LOCALES = new Set(['fr', 'en', 'es', 'sw', 'ln', 'rw']);

export async function translateText(
  text: string,
  sourceLocale: string,
  targetLocale: string,
  format: 'text' | 'html' = 'text',
): Promise<string> {
  if (sourceLocale === targetLocale || text.trim() === '') return text;
  if (!TRANSLATABLE_LOCALES.has(sourceLocale) || !TRANSLATABLE_LOCALES.has(targetLocale)) {
    throw new Error(`Unsupported translation locale: ${sourceLocale} -> ${targetLocale}`);
  }

  const endpoint = process.env.LIBRETRANSLATE_URL;
  if (!endpoint) {
    throw new Error('LIBRETRANSLATE_URL is not configured on the server.');
  }

  const requestUrl = new URL(endpoint);
  if (!['http:', 'https:'].includes(requestUrl.protocol)) {
    throw new Error('LIBRETRANSLATE_URL must use HTTP or HTTPS.');
  }

  const apiKey = process.env.LIBRETRANSLATE_API_KEY;
  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-api-key': apiKey } : {}),
    },
    body: JSON.stringify({
      q: text,
      source: sourceLocale,
      target: targetLocale,
      format,
      ...(apiKey ? { api_key: apiKey } : {}),
    }),
    signal: AbortSignal.timeout(90_000),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`LibreTranslate returned HTTP ${response.status}.`);
  }

  const result: unknown = await response.json();
  if (
    typeof result !== 'object'
    || result === null
    || !('translatedText' in result)
    || typeof result.translatedText !== 'string'
  ) {
    throw new Error('LibreTranslate returned an invalid response.');
  }

  return result.translatedText;
}

export async function translateArticleContent(
  content: unknown,
  sourceLocale: string,
  targetLocale: string,
): Promise<unknown> {
  if (typeof content === 'string') {
    return translateText(content, sourceLocale, targetLocale, 'html');
  }

  if (Array.isArray(content)) {
    return Promise.all(content.map((value) =>
      translateArticleContent(value, sourceLocale, targetLocale),
    ));
  }

  if (content && typeof content === 'object') {
    const entries = await Promise.all(Object.entries(content).map(async ([key, value]) => {
      if (
        ['text', 'caption', 'alt', 'title', 'description'].includes(key)
        && typeof value === 'string'
      ) {
        return [key, await translateText(value, sourceLocale, targetLocale)] as const;
      }

      return [
        key,
        await translateArticleContent(value, sourceLocale, targetLocale),
      ] as const;
    }));

    return Object.fromEntries(entries);
  }

  return content;
}
