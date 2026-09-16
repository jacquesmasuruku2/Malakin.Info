import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';

export const ImageWithCaption = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          if (element.tagName === 'FIGURE') {
            return element.querySelector('figcaption')?.textContent?.trim() || null;
          }
          return element.getAttribute('data-caption') || element.getAttribute('alt');
        },
        renderHTML: (attributes: { caption?: string | null }) => {
          if (!attributes.caption) return {};
          return { 'data-caption': attributes.caption };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (node) => {
          const element = node as HTMLElement;
          const image = element.querySelector('img');
          if (!image?.getAttribute('src')) return false;
          return {
            src: image.getAttribute('src'),
            alt: image.getAttribute('alt'),
            title: image.getAttribute('title'),
            caption:
              element.querySelector('figcaption')?.textContent?.trim() ||
              image.getAttribute('alt'),
          };
        },
      },
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { caption, ...imageAttributes } = HTMLAttributes;
    const image = ['img', mergeAttributes(this.options.HTMLAttributes, imageAttributes)];
    const text = String(caption || imageAttributes.alt || '').trim();

    if (!text) {
      return ['figure', { class: 'article-inline-figure' }, image];
    }

    return [
      'figure',
      { class: 'article-inline-figure' },
      image,
      ['figcaption', {}, text],
    ];
  },
});
