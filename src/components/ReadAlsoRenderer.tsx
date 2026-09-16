'use client';

import ReadAlso from './ReadAlso';
import { prepareArticleHtml, type ArticleTagItem } from '@/lib/tags';

interface ReadAlsoRendererProps {
  content: string;
  tags?: ArticleTagItem[];
  locale?: string;
}

const proseClasses = "article-body prose prose-lg w-full min-w-0 max-w-none !max-w-none break-words text-[1.02rem] leading-[1.9] text-foreground md:text-[1.12rem] prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-[-0.02em] prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:mb-5 prose-p:mt-0 prose-p:first-of-type:font-bold prose-p:first-of-type:text-[1.08em] prose-p:first-of-type:leading-[1.8] prose-p:first-of-type:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:my-2 prose-img:h-auto prose-img:max-w-full prose-img:rounded-none prose-img:shadow-none prose-figure:my-3 prose-figcaption:mt-2 prose-figcaption:text-left prose-figcaption:text-sm prose-figcaption:italic prose-figcaption:text-muted-foreground prose-table:block prose-table:max-w-full prose-table:overflow-x-auto prose-pre:max-w-full prose-pre:overflow-x-auto prose-iframe:max-w-full prose-strong:text-foreground prose-blockquote:border-l-2 prose-blockquote:border-border prose-blockquote:pl-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-1";

const hasParagraphContent = (html: string) => /<(p|blockquote|li)\b/i.test(html);

const addDropCap = (html: string) => {
  if (!html || !html.trim()) {
    return html;
  }

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const paragraphs = Array.from(doc.querySelectorAll('p, blockquote, li')).filter((node) => {
      const text = node.textContent?.trim() || '';
      return text.length > 0 && !node.closest('[data-type="read-also"]');
    });

    const firstParagraph = paragraphs[0];
    if (firstParagraph) {
      firstParagraph.classList.remove('article-dropcap');
      firstParagraph.classList.add('article-dropcap');
    }

    return doc.body.innerHTML;
  } catch {
    return html;
  }
};

export default function ReadAlsoRenderer({
  content,
  tags = [],
  locale = 'fr',
}: ReadAlsoRendererProps) {
  if (!content) {
    return null;
  }

  const html = prepareArticleHtml(content, tags, locale);
  const hasBrowserDom = typeof window !== 'undefined' && typeof DOMParser !== 'undefined';

  if (!hasBrowserDom) {
    return (
      <>
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className={proseClasses}
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        />
      </>
    );
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks = Array.from(doc.querySelectorAll('div[data-type="read-also"]'));

  if (blocks.length === 0) {
    return (
      <>
        <div
          dangerouslySetInnerHTML={{ __html: addDropCap(html) }}
          className={proseClasses}
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        />
      </>
    );
  }

  const elements: React.ReactNode[] = [];
  let cursor = 0;
  let dropCapApplied = false;

  blocks.forEach((block, index) => {
    const rawBlock = block.outerHTML;
    const blockIndex = html.indexOf(rawBlock, cursor);

    if (blockIndex > cursor) {
      const beforeContent = html.slice(cursor, blockIndex);
      if (beforeContent.trim() && !dropCapApplied && hasParagraphContent(beforeContent)) {
        dropCapApplied = true;
        elements.push(
          <div
            key={`before-${index}`}
            dangerouslySetInnerHTML={{ __html: addDropCap(beforeContent) }}
            className={proseClasses}
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          />
        );
      } else if (beforeContent.trim()) {
        elements.push(
          <div
            key={`before-${index}`}
            dangerouslySetInnerHTML={{ __html: beforeContent }}
            className={proseClasses}
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          />
        );
      }
    }

    const title = block.getAttribute('data-title') || '';
    const url = block.getAttribute('data-url') || '';
    const accentColor = block.getAttribute('data-accent-color') || '#2563eb';

    elements.push(
      <ReadAlso
        key={`read-also-${index}`}
        title={title}
        url={url}
        accentColor={accentColor}
      />
    );

    cursor = blockIndex >= 0 ? blockIndex + rawBlock.length : cursor;
  });

  const remainingContent = html.slice(cursor);
  if (remainingContent.trim()) {
    if (!dropCapApplied && hasParagraphContent(remainingContent)) {
      dropCapApplied = true;
      elements.push(
        <div
          key="after-read-also"
          dangerouslySetInnerHTML={{ __html: addDropCap(remainingContent) }}
          className={proseClasses}
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        />
      );
    } else {
      elements.push(
        <div
          key="after-read-also"
          dangerouslySetInnerHTML={{ __html: remainingContent }}
          className={proseClasses}
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        />
      );
    }
  }

  return <>{elements}</>;
}
