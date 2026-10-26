import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import SocialEmbedNode from './SocialEmbedNode';
import { normalizeSocialEmbed, type SocialEmbedPlatform } from './social-embed';

export interface SocialEmbedAttributes {
  platform: SocialEmbedPlatform;
  url: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    socialEmbed: {
      insertSocialEmbed: (attributes: SocialEmbedAttributes) => ReturnType;
    };
  }
}

export const SocialEmbedExtension = Node.create<SocialEmbedAttributes>({
  name: 'socialEmbed',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      platform: { default: 'x' },
      url: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="social-embed"]',
        getAttrs: (node) => {
          const element = node as HTMLElement;
          const platform = element.getAttribute('data-platform');
          const url = element.getAttribute('data-url') || '';
          if (platform !== 'x' && platform !== 'facebook') return false;
          const embed = normalizeSocialEmbed(platform, url);
          return embed ? { platform: embed.platform, url: embed.url } : false;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const platform = node.attrs.platform as SocialEmbedPlatform;
    const embed = normalizeSocialEmbed(platform, node.attrs.url);
    if (!embed) {
      return ['figure', mergeAttributes(HTMLAttributes, { 'data-type': 'social-embed' })];
    }

    return [
      'figure',
      mergeAttributes(HTMLAttributes, {
        class: 'article-social-embed',
        'data-type': 'social-embed',
        'data-platform': embed.platform,
        'data-url': embed.url,
      }),
      [
        'iframe',
        {
          src: embed.src,
          title: embed.title,
          width: '550',
          height: String(embed.height),
          loading: 'lazy',
          allowfullscreen: 'true',
          referrerpolicy: 'strict-origin-when-cross-origin',
          style: `width:100%;max-width:550px;height:${embed.height}px;border:0;`,
        },
      ],
      [
        'a',
        {
          class: 'article-social-embed-link',
          href: embed.url,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        `Voir cette publication sur ${embed.platform === 'x' ? 'X' : 'Facebook'}`,
      ],
    ];
  },

  addCommands() {
    return {
      insertSocialEmbed:
        (attributes) =>
        ({ commands }) => {
          const embed = normalizeSocialEmbed(attributes.platform, attributes.url);
          if (!embed) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { platform: embed.platform, url: embed.url },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(SocialEmbedNode);
  },
});
