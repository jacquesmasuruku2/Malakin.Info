import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_TRANSLATION_LOCALES = ['fr', 'en', 'es', 'sw'] as const;
type SupportedTranslationLocale = (typeof SUPPORTED_TRANSLATION_LOCALES)[number];

const FALLBACK_LOCALE: SupportedTranslationLocale = 'fr';
const LIBRETRANSLATE_URL =
  process.env.LIBRETRANSLATE_URL ?? 'http://127.0.0.1:5000/translate';

function resolveLocale(locale?: string | null): SupportedTranslationLocale {
  const normalized = (locale ?? 'fr').toLowerCase();

  if (normalized === 'ln' || normalized === 'rw') {
    return FALLBACK_LOCALE;
  }

  if ((SUPPORTED_TRANSLATION_LOCALES as readonly string[]).includes(normalized)) {
    return normalized as SupportedTranslationLocale;
  }

  return FALLBACK_LOCALE;
}

function isPlainText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
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

    const resolvedSourceLang = resolveLocale(sourceLang);
    const resolvedTargetLang = resolveLocale(targetLang);

    // Le serveur LibreTranslate ne supporte pas les langues non incluses dans ses modèles.
    // Pour 'ln' et 'rw', on bascule automatiquement sur 'fr'.
    const payload = {
      q: text,
      source: resolvedSourceLang,
      target: resolvedTargetLang,
      format: 'text',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
  return NextResponse.json({
    ok: true,
    message: 'Route de traduction accessible. Utiliser une requête POST avec { text, sourceLang, targetLang }.',
  });
}
