'use client';

import ReadAlso from './ReadAlso';

interface ReadAlsoRendererProps {
  content: string;
}

const proseClasses = "prose prose-sm sm:prose-base md:prose-lg max-w-none prose-img:my-2 prose-img:rounded-lg prose-img:shadow-md prose-h2:mt-6 prose-h2:mb-3 prose-h3:mt-5 prose-h3:mb-2 prose-p:my-2 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium text-foreground leading-relaxed prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground";

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
