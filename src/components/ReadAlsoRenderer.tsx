'use client';

import ReadAlso from './ReadAlso';

interface ReadAlsoRendererProps {
  content: string;
}

const proseClasses = "prose prose-lg w-full max-w-none !max-w-none text-[1.02rem] leading-[1.9] text-gray-800 md:text-[1.12rem] prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-[-0.02em] prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:mb-5 prose-p:mt-0 prose-p:first-of-type:font-bold prose-p:first-of-type:text-[1.08em] prose-p:first-of-type:leading-[1.8] prose-p:first-of-type:text-gray-900 prose-a:text-red-700 prose-a:no-underline hover:prose-a:underline prose-img:my-6 prose-img:rounded-none prose-img:shadow-none prose-strong:text-gray-900 prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-1";

const addDropCap = (html: string, force = false) => {
  if (!html || !html.trim()) {
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
      if (force || !firstParagraph.classList.contains('article-dropcap')) {
        firstParagraph.classList.add('article-dropcap');
      }
    }

    return doc.body.innerHTML;
  } catch {
    return html;
  }
};

export default function ReadAlsoRenderer({ content }: ReadAlsoRendererProps) {
  if (!content) {
    return null;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const blocks = Array.from(doc.querySelectorAll('div[data-type="read-also"]'));

  if (blocks.length === 0) {
    return (
      <>
        <style>{`
          .article-dropcap {
            font-weight: 700;
            color: #111827;
            margin-top: 0.18em;
          }

          .article-dropcap:first-letter {
            float: left;
            font-family: Georgia, serif;
            font-size: clamp(4.5rem, 7.4vw, 8rem);
            line-height: 0.72;
            padding-right: 0.11em;
            padding-top: 0.08em;
            margin-right: 0.04em;
            font-weight: 700;
            color: #0d1b2a;
            letter-spacing: -0.05em;
            display: inline-block;
            transform: translateY(-0.03em);
            opacity: 0.98;
            text-shadow: 0 0 0 rgba(13, 27, 42, 0.08);
          }
        `}</style>
        <div
          dangerouslySetInnerHTML={{ __html: addDropCap(content) }}
          className={proseClasses}
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        />
      </>
    );
  }

  const elements: React.ReactNode[] = [];
  let cursor = 0;

  blocks.forEach((block, index) => {
    const rawBlock = block.outerHTML;
    const blockIndex = content.indexOf(rawBlock, cursor);

    if (blockIndex > cursor) {
      const beforeContent = content.slice(cursor, blockIndex);
      if (beforeContent.trim()) {
        const shouldApplyDropCap = index === 0 && cursor === 0;
        elements.push(
          <div
            key={`before-${index}`}
            dangerouslySetInnerHTML={{ __html: addDropCap(beforeContent, shouldApplyDropCap) }}
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

  const remainingContent = content.slice(cursor);
  if (remainingContent.trim()) {
    elements.push(
      <div
        key="after-read-also"
        dangerouslySetInnerHTML={{ __html: remainingContent }}
        className={proseClasses}
        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
      />
    );
  }

  return <>{elements}</>;
}
