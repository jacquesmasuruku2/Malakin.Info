import { Extension } from '@tiptap/core';

export const ParagraphSpacing = Extension.create({
  name: 'paragraphSpacing',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          marginTop: {
            default: null,
            parseHTML: (element) => element.style.marginTop || element.style.marginBlockStart || null,
            renderHTML: ({ marginTop }) =>
              marginTop ? { style: `margin-top: ${marginTop}` } : {},
          },
          marginBottom: {
            default: null,
            parseHTML: (element) => element.style.marginBottom || element.style.marginBlockEnd || null,
            renderHTML: ({ marginBottom }) =>
              marginBottom ? { style: `margin-bottom: ${marginBottom}` } : {},
          },
        },
      },
    ];
  },
});