import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTranslator } from '@/lib/translator';
import { saveCategoryTranslation } from '@/lib/translation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { targetLocale } = body;

    if (!targetLocale) {
      return NextResponse.json(
        { error: 'Target locale is required' },
        { status: 400 }
      );
    }

    // Get the category
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if translation already exists
    const existingTranslation = await (prisma as any).categoryTranslation.findFirst({
      where: {
        categoryId: id,
        locale: targetLocale
      }
    });

    if (existingTranslation) {
      return NextResponse.json({
        message: 'Translation already exists',
        translation: existingTranslation
      });
    }

    // Get translator
    const translator = getTranslator();

    // Translate title
    const titleResult = await translator.translate(
      category.title,
      category.defaultLocale || 'fr',
      targetLocale
    );

    if (!titleResult.success) {
      return NextResponse.json(
        { error: 'Translation failed', details: titleResult.error },
        { status: 500 }
      );
    }

    // Translate description if it exists
    let translatedDescription = null;
    if (category.description) {
      const descResult = await translator.translate(
        category.description,
        category.defaultLocale || 'fr',
        targetLocale
      );

      if (descResult.success && descResult.translatedText) {
        translatedDescription = descResult.translatedText;
      }
    }

    // Save the translation
    await saveCategoryTranslation(id, targetLocale, {
      title: titleResult.translatedText || category.title,
      description: translatedDescription
    });

    return NextResponse.json({
      message: 'Translation created successfully',
      translation: {
        categoryId: id,
        locale: targetLocale,
        title: titleResult.translatedText,
        description: translatedDescription
      }
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}