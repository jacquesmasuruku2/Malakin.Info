import { mergeAttributes, Node } from '@tiptap/core';

export type ArticleMediaKind = 'audio' | 'video';

export interface ArticleMediaAttributes {
  kind: ArticleMediaKind;
  src: string;
  title?: string;
  author?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    articleMedia: {
      insertArticleMedia: (attributes: ArticleMediaAttributes) => ReturnType;
    };
  }
}

export const MediaExtension = Node.create<ArticleMediaAttributes>({
  name: 'articleMedia',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      kind: { default: 'video' },
      src: { default: '' },
      title: { default: '' },
      author: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-author') || element.getAttribute('author') || '',
        renderHTML: ({ author }) => (author ? { 'data-author': author } : {}),
      },
    };
  },

  parseHTML() {
    return (['audio', 'video'] as const).map((kind) => ({
      tag: kind,
      getAttrs: (node: HTMLElement) => {
        const src = node.getAttribute('src') || node.querySelector('source')?.getAttribute('src');
        return src
          ? {
              kind,
              src,
              title: node.getAttribute('title') || '',
              author: node.getAttribute('data-author') || node.getAttribute('author') || '',
            }
          : false;
      },
    }));
  },

  renderHTML({ node, HTMLAttributes }) {
    const kind: ArticleMediaKind = node.attrs.kind === 'audio' ? 'audio' : 'video';
    const attributes = mergeAttributes(HTMLAttributes, {
      class: 'article-inline-media',
      controls: '',
      preload: 'metadata',
      ...(kind === 'video' ? { playsinline: '' } : {}),
    });

    return [kind, attributes];
  },

  addCommands() {
    return {
      insertArticleMedia:
        (attributes: ArticleMediaAttributes) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: attributes,
          }),
    };
  },
});
