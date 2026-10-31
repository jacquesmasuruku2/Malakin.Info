import { NextRequest, NextResponse } from 'next/server';
import { isTranslationAdminAuthorized } from '@/lib/translation-auth';

const SUPPORTED_TRANSLATION_LOCALES = ['fr', 'en', 'es', 'sw', 'ln', 'rw'] as const;
type SupportedTranslationLocale = (typeof SUPPORTED_TRANSLATION_LOCALES)[number];

function isPlainText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  if (!isTranslationAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const text = body?.text;
    const sourceLang = typeof body?.sourceLang === 'string' ? body.sourceLang : 'fr';
    const targetLang = typeof body?.targetLang === 'string' ? body.targetLang : 'fr';

    if (!isPlainText(text)) {
      return NextResponse.json(
        {
          error: 'Le champ text est requis et ne peut pas être vide.',
        },
        { status: 400 }
      );
    }

    if (
      !(SUPPORTED_TRANSLATION_LOCALES as readonly string[]).includes(sourceLang)
      || !(SUPPORTED_TRANSLATION_LOCALES as readonly string[]).includes(targetLang)
    ) {
      return NextResponse.json({ error: 'Unsupported source or target locale.' }, { status: 400 });
    }

    const resolvedSourceLang = sourceLang as SupportedTranslationLocale;
    const resolvedTargetLang = targetLang as SupportedTranslationLocale;
    const libreTranslateUrl = process.env.LIBRETRANSLATE_URL;
    if (!libreTranslateUrl) {
      return NextResponse.json({ error: 'Translation service is not configured.' }, { status: 503 });
    }

    const payload = {
      q: text,
      source: resolvedSourceLang,
      target: resolvedTargetLang,
      format: 'text',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const apiKey = process.env.LIBRETRANSLATE_API_KEY;
    const response = await fetch(libreTranslateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {}),
      },
      body: JSON.stringify({ ...payload, ...(apiKey ? { api_key: apiKey } : {}) }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `LibreTranslate a répondu avec le statut ${response.status}: ${errorText || response.statusText}`
      );
    }

    const data = (await response.json()) as { translatedText?: string };

    if (!data.translatedText) {
      throw new Error('LibreTranslate n’a renvoyé aucun contenu traduit.');
    }

    return NextResponse.json({
      translatedText: data.translatedText,
      sourceLang: resolvedSourceLang,
      targetLang: resolvedTargetLang,
      originalTargetLang: targetLang,
    });
  } catch (error) {
    console.error('[translate API] Erreur de traduction:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Erreur inconnue lors de la traduction.';

    return NextResponse.json(
      {
        error: 'La traduction a échoué.',
        details: message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 });
}
