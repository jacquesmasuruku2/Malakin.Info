import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTranslator } from '@/lib/translator';
import { saveArticleTranslation } from '@/lib/translation';

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

    // Get the article
    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if translation already exists
    const existingTranslation = await prisma.articleTranslation.findUnique({
      where: {
        articleId_locale: {
          articleId: id,
          locale: targetLocale
        }
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

    // Prepare content for translation
    const content = {
      title: article.title,
      excerpt: article.excerpt,
      content: typeof article.content === 'string' ? article.content : JSON.stringify(article.content)
    };

    // Translate the content
    const result = await translator.translateArticle(
      content,
      article.defaultLocale || 'fr',
      targetLocale
    );

    if (!result.success || !result.translatedContent) {
      return NextResponse.json(
        { error: 'Translation failed', details: result.error },
        { status: 500 }
      );
    }

    // Save the translation
    await saveArticleTranslation(id, targetLocale, {
      title: result.translatedContent.title,
      excerpt: result.translatedContent.excerpt,
      content: result.translatedContent.content
    });

    return NextResponse.json({
      message: 'Translation created successfully',
      translation: {
        articleId: id,
        locale: targetLocale,
        title: result.translatedContent.title,
        excerpt: result.translatedContent.excerpt
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