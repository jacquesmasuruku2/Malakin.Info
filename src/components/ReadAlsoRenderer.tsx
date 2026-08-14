'use client';

import ReadAlso from './ReadAlso';

interface ReadAlsoRendererProps {
  content: string;
}

const proseClasses = "prose prose-base w-full max-w-none !max-w-none font-sans text-base leading-relaxed text-gray-800 prose-headings:font-bold prose-headings:text-gray-900 prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:mb-5 prose-p:mt-0 prose-a:text-red-700 prose-a:no-underline hover:prose-a:underline prose-img:my-6 prose-img:rounded-none prose-img:shadow-none prose-strong:text-gray-900 prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-1";

export default function ReadAlsoRenderer({ content }: ReadAlsoRendererProps) {
  if (!content) {
    return null;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const blocks = Array.from(doc.querySelectorAll('div[data-type="read-also"]'));

  if (blocks.length === 0) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className={proseClasses}
      />
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
        elements.push(
          <div
            key={`before-${index}`}
            dangerouslySetInnerHTML={{ __html: beforeContent }}
            className={proseClasses}
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
      />
    );
  }

  return <>{elements}</>;
}
