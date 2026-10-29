import { Extension } from '@tiptap/core';

export const WordTableStyle = Extension.create({
  name: 'wordTableStyle',

  addGlobalAttributes() {
    return [
      {
        types: ['table', 'tableCell', 'tableHeader'],
        attributes: {
          importedStyle: {
            default: null,
            parseHTML: (element) => element.getAttribute('style') || null,
            renderHTML: ({ importedStyle }) => importedStyle ? { style: importedStyle } : {},
          },
        },
      },
    ];
  },
});