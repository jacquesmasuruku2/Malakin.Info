'use client';

import { useEffect, useState } from 'react';
import ReadAlso from './ReadAlso';

interface ReadAlsoRendererProps {
  content: string;
}

interface ReadAlsoData {
  title: string;
  url: string;
  accentColor?: string;
}

export default function ReadAlsoRenderer({ content }: ReadAlsoRendererProps) {
  const [processedContent, setProcessedContent] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    if (!content) {
      setProcessedContent([]);
      return;
    }

    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Find all read-also blocks
    const readAlsoBlocks = doc.querySelectorAll('div[data-type="read-also"]');
    
    if (readAlsoBlocks.length === 0) {
      // No read-also blocks, render as plain HTML
      setProcessedContent([
        <div 
          key="content" 
          dangerouslySetInnerHTML={{ __html: content }} 
          className="prose prose-sm sm:prose-base md:prose-lg max-w-none prose-img:my-6 prose-img:rounded-lg prose-img:shadow-md prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium text-foreground leading-relaxed prose-headings:text-foreground prose-p:text-foreground prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-strong:text-foreground"
        />
      ]);
      return;
    }

    // Split content and replace read-also blocks with components
    const elements: React.ReactElement[] = [];
    let lastIndex = 0;

    readAlsoBlocks.forEach((block, index) => {
      // Get content before this block
      const beforeContent = content.substring(lastIndex, (block as any).start || 0);
      
      if (beforeContent) {
        elements.push(
          <div 
            key={`before-${index}`}
            dangerouslySetInnerHTML={{ __html: beforeContent }}
            className="prose prose-sm sm:prose-base md:prose-lg max-w-none prose-img:my-6 prose-img:rounded-lg prose-img:shadow-md prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium text-foreground leading-relaxed prose-headings:text-foreground prose-p:text-foreground prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-strong:text-foreground"
          />
        );
      }

      // Extract data from the block
      const title = block.getAttribute('data-title') || '';
      const url = block.getAttribute('data-url') || '';
      const accentColor = block.getAttribute('data-accent-color') || '#2563eb';

      // Add ReadAlso component
      elements.push(
        <ReadAlso 
          key={`read-also-${index}`}
          title={title}
          url={url}
          accentColor={accentColor}
        />
      );

      // Update last index
      lastIndex = (block as any).end || content.length;
    });

    // Add remaining content after last block
    const afterContent = content.substring(lastIndex);
    if (afterContent) {
      elements.push(
        <div 
          key="after"
          dangerouslySetInnerHTML={{ __html: afterContent }}
          className="prose prose-sm sm:prose-base md:prose-lg max-w-none prose-img:my-6 prose-img:rounded-lg prose-img:shadow-md prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium text-foreground leading-relaxed prose-headings:text-foreground prose-p:text-foreground prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-strong:text-foreground"
        />
      );
    }

    setProcessedContent(elements);
  }, [content]);

  // Alternative approach: Use regex to find and replace
  const renderContent = () => {
    if (!content) return null;

    // More flexible regex to handle different attribute orders
    const regex = /<div[^>]*data-type="read-also"[^>]*data-title="([^"]*)"[^>]*data-url="([^"]*)"[^>]*data-accent-color="([^"]*)"[^>]*>/g;
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add content before the match
      const before = content.substring(lastIndex, match.index);
      if (before) {
        parts.push(
          <div 
            key={`before-${match.index}`}
            dangerouslySetInnerHTML={{ __html: before }}
            className="prose prose-sm sm:prose-base md:prose-lg max-w-none prose-img:my-6 prose-img:rounded-lg prose-img:shadow-md prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium text-foreground leading-relaxed prose-headings:text-foreground prose-p:text-foreground prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-strong:text-foreground"
          />
        );
      }

      // Add ReadAlso component
      parts.push(
        <ReadAlso 
          key={`read-also-${match.index}`}
          title={match[1]}
          url={match[2]}
          accentColor={match[3]}
        />
      );

      lastIndex = match.index + match[0].length;
      
      // Find the closing div
      const closingDiv = content.indexOf('</div>', lastIndex);
      if (closingDiv !== -1) {
        lastIndex = closingDiv + 6; // Skip past </div>
      }
    }

    // Add remaining content
    const after = content.substring(lastIndex);
    if (after) {
      parts.push(
        <div 
          key="after"
          dangerouslySetInnerHTML={{ __html: after }}
          className="prose prose-sm sm:prose-base md:prose-lg max-w-none prose-img:my-6 prose-img:rounded-lg prose-img:shadow-md prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium text-foreground leading-relaxed prose-headings:text-foreground prose-p:text-foreground prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-strong:text-foreground"
        />
      );
    }

    return parts.length > 0 ? parts : (
      <div 
        dangerouslySetInnerHTML={{ __html: content }}
        className="prose prose-sm sm:prose-base md:prose-lg max-w-none prose-img:my-6 prose-img:rounded-lg prose-img:shadow-md prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium text-foreground leading-relaxed prose-headings:text-foreground prose-p:text-foreground prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-strong:text-foreground"
      />
    );
  };

  return <>{renderContent()}</>;
}
