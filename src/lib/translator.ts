/**
 * Translation Service
 * Handles automatic translation of content using various translation APIs
 */

export interface TranslationResult {
  success: boolean;
  translatedText?: string;
  error?: string;
}

export interface ContentTranslation {
  title: string;
  excerpt: string;
  content: string;
}

/**
 * Simple translation using LibreTranslate (free, open-source)
 * You can host your own instance or use a public one
 */
export class Translator {
  private apiUrl: string;
  private apiKey?: string;

  constructor(apiUrl: string = 'https://libretranslate.com/translate', apiKey?: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Translate text from source language to target language
   */
  async translate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        translatedText: data.translatedText
      };
    } catch (error) {
      console.error('Translation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown translation error'
      };
    }
  }

  /**
   * Translate HTML content while preserving tags
   */
  async translateHtml(
    html: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult> {
    try {
      // Simple HTML tag preservation
      // Extract text content, translate it, then rebuild HTML
      const tagRegex = /<[^>]*>/g;
      const tags: string[] = [];
      let cleanText = html;
      let match;

      // Extract and store tags
      while ((match = tagRegex.exec(html)) !== null) {
        tags.push(match[0]);
      }

      // Replace tags with placeholders
      let textWithPlaceholders = html;
      tags.forEach((tag, index) => {
        textWithPlaceholders = textWithPlaceholders.replace(tag, `__TAG_${index}__`);
      });

      // Translate the text
      const translationResult = await this.translate(textWithPlaceholders, sourceLang, targetLang);
      
      if (!translationResult.success || !translationResult.translatedText) {
        return translationResult;
      }

      // Restore tags
      let translatedHtml = translationResult.translatedText;
      tags.forEach((tag, index) => {
        translatedHtml = translatedHtml.replace(`__TAG_${index}__`, tag);
      });

      return {
        success: true,
        translatedText: translatedHtml
      };
    } catch (error) {
      console.error('HTML translation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown HTML translation error'
      };
    }
  }

  /**
   * Translate full article content
   */
  async translateArticle(
    content: ContentTranslation,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult & { translatedContent?: ContentTranslation }> {
    try {
      // Translate title
      const titleResult = await this.translate(content.title, sourceLang, targetLang);
      if (!titleResult.success) {
        return titleResult;
      }

      // Translate excerpt
      const excerptResult = await this.translate(content.excerpt, sourceLang, targetLang);
      if (!excerptResult.success) {
        return excerptResult;
      }

      // Translate content (assuming it's HTML)
      const contentResult = await this.translateHtml(content.content, sourceLang, targetLang);
      if (!contentResult.success) {
        return contentResult;
      }

      return {
        success: true,
        translatedContent: {
          title: titleResult.translatedText || content.title,
          excerpt: excerptResult.translatedText || content.excerpt,
          content: contentResult.translatedText || content.content
        }
      };
    } catch (error) {
      console.error('Article translation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown article translation error'
      };
    }
  }
}

/**
 * Mock translator for development/testing
 * This simulates translation by adding a prefix to show it's "translated"
 */
export class MockTranslator extends Translator {
  async translate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult> {
    // Simulate translation delay
    await new Promise(resolve => setTimeout(resolve, 100));

    if (sourceLang === targetLang) {
      return {
        success: true,
        translatedText: text
      };
    }

    // Mock translation - just add language prefix
    const prefix = targetLang === 'en' ? '[EN] ' : '[FR] ';
    return {
      success: true,
      translatedText: prefix + text
    };
  }

  async translateHtml(
    html: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult> {
    // Simulate translation delay
    await new Promise(resolve => setTimeout(resolve, 200));

    if (sourceLang === targetLang) {
      return {
        success: true,
        translatedText: html
      };
    }

    // Mock HTML translation - preserve structure, translate text nodes
    const prefix = targetLang === 'en' ? '[EN] ' : '[FR] ';
    
    // Simple text node replacement
    const textRegex = />([^<]+)</g;
    const translatedHtml = html.replace(textRegex, (match, text) => {
      if (text.trim()) {
        return `>${prefix}${text}<`;
      }
      return match;
    });

    return {
      success: true,
      translatedText: translatedHtml
    };
  }
}

/**
 * Get translator instance based on environment
 */
export function getTranslator(): Translator {
  const useMock = process.env.USE_MOCK_TRANSLATOR === 'true';
  const apiUrl = process.env.TRANSLATION_API_URL;
  const apiKey = process.env.TRANSLATION_API_KEY;

  if (useMock || !apiUrl) {
    console.log('Using mock translator for development');
    return new MockTranslator();
  }

  return new Translator(apiUrl, apiKey);
}