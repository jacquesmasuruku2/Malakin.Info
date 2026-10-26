import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { normalizeSocialEmbed, type SocialEmbedPlatform } from './social-embed';

export default function SocialEmbedNode({ node, deleteNode }: ReactNodeViewProps) {
  const platform = node.attrs.platform as SocialEmbedPlatform;
  const embed = normalizeSocialEmbed(platform, node.attrs.url);

  if (!embed) {
    return (
      <NodeViewWrapper className="my-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
        URL d’embed invalide.
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="my-4" contentEditable={false}>
      <div className="mx-auto w-full max-w-[550px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
          <span>{embed.title}</span>
          <div className="flex items-center gap-1">
            <a
              href={embed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
              title="Ouvrir la publication"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={deleteNode}
              className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600"
              title="Supprimer l’embed"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <iframe
          src={embed.src}
          title={embed.title}
          width="550"
          height={embed.height}
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="block w-full border-0"
          style={platform === 'youtube' ? { height: 'auto', aspectRatio: '16 / 9' } : undefined}
        />
      </div>
    </NodeViewWrapper>
  );
}
