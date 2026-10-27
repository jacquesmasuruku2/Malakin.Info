'use client';

import mammoth from 'mammoth';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import {
  BackgroundColor,
  FontFamily,
  FontSize,
  LineHeight,
  TextStyle,
} from '@tiptap/extension-text-style';
import { ReadAlsoExtension } from '@/lib/tiptap/ReadAlsoExtension';
import ReadAlsoModal from '@/components/ReadAlsoModal';
import { ImageWithCaption } from '@/lib/tiptap/ImageWithCaption';
import { SocialEmbedExtension } from '@/lib/tiptap/SocialEmbedExtension';
import { MediaExtension, type ArticleMediaKind } from '@/lib/tiptap/MediaExtension';
import { normalizeSocialEmbed, type SocialEmbedPlatform } from '@/lib/tiptap/social-embed';
import { cleanTagName, slugifyTag } from '@/lib/tag-name';
import { useState, useEffect, useRef } from 'react';
import { 
  Scissors, 
  Copy, 
  Clipboard, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  IndentDecrease,
  Minus,
  Plus,
  Type,
  Palette,
  Search,
  ZoomIn,
  ZoomOut,
  FileText,
  Image as ImageIcon,
  AudioLines,
  Video,
  Loader2,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table,
  ExternalLink,
  Link as LinkIcon,
  Unlink,
  Hash,
  Code2,
  X,
  Undo2,
  Redo2,
  Music2,
} from 'lucide-react';

interface WordEditorProps {
  content: string | Record<string, unknown> | null | undefined;
  onChange: (content: string) => void;
  locale?: string;
  onAddTag?: (name: string) => void;
  enableSocialEmbed?: boolean;
}

const INLINE_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Arial Black', value: '"Arial Black", Arial, sans-serif' },
  { label: 'Calibri', value: 'Calibri, Arial, sans-serif' },
  { label: 'Cambria', value: 'Cambria, Georgia, serif' },
  { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Inter', value: 'Inter, Arial, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Arial, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Garamond', value: 'Garamond, "Times New Roman", serif' },
  { label: 'Palatino Linotype', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'System UI', value: 'system-ui, sans-serif' },
  { label: 'Sans-serif', value: 'sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
];
const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '32', '36', '48', '72'];

function getFontFamilySelection(value: string | null | undefined) {
  if (!value) return FONT_FAMILIES[0].value;
  const firstFamily = value.split(',')[0].trim().replace(/^['"]|['"]$/g, '').toLowerCase();
  return FONT_FAMILIES.find((family) => family.label.toLowerCase() === firstFamily)?.value || value;
}

function isImageFile(file: File) {
  return INLINE_IMAGE_TYPES.includes(file.type);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizePastedHtml(html: string): string {
  if (!html || !html.trim()) return '';

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const root = doc.body;

    root.querySelectorAll('script, style, iframe, object, embed, svg, meta, title, link, noscript, template').forEach((node) => node.remove());

    root.querySelectorAll('*').forEach((node) => {
      const tagName = node.tagName.toLowerCase();
      const className = node.getAttribute('class') || '';
      const style = node.getAttribute('style') || '';

      if (className) {
        const cleanedClass = className.split(/\s+/).filter((name) => !/^(mso|WordSection|wp|gmail|moz|apple|webkit)/i.test(name)).join(' ');
        if (cleanedClass) {
          node.setAttribute('class', cleanedClass);
        } else {
          node.removeAttribute('class');
        }
      }

      if (style) {
        const cleanedStyle = style
          .replace(/mso-[^;]+;?/gi, '')
          .replace(/-webkit-[^;]+;?/gi, '')
          .replace(/display:\s*none;?/gi, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanedStyle) {
          node.setAttribute('style', cleanedStyle);
        } else {
          node.removeAttribute('style');
        }
      }

      if (tagName === 'span' && !node.textContent?.trim() && !node.hasAttribute('style')) {
        node.replaceWith(...Array.from(node.childNodes));
      }
    });

    return root.innerHTML.trim();
  } catch (error) {
    console.error('[WordEditor paste sanitize]', error);
    return html;
  }
}

function normalizeImportedWordHtml(html: string): string {
  if (!html || !html.trim()) return '';

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const root = doc.body;

    root.querySelectorAll('script, style, iframe, object, embed, svg, meta, title, link, noscript, template').forEach((node) => node.remove());

    root.querySelectorAll('*').forEach((node) => {
      const tagName = node.tagName.toLowerCase();
      const className = node.getAttribute('class') || '';
      const style = node.getAttribute('style') || '';

      if (className) {
        const cleanedClass = className
          .split(/\s+/)
          .filter((name) => !/^(mso|WordSection|wp|gmail|moz|apple|webkit)/i.test(name))
          .join(' ');

        if (cleanedClass) {
          node.setAttribute('class', cleanedClass);
        } else {
          node.removeAttribute('class');
        }
      }

      if (style) {
        const cleanedStyle = style
          .replace(/mso-[^;]+;?/gi, '')
          .replace(/-webkit-[^;]+;?/gi, '')
          .replace(/display:\s*none;?/gi, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanedStyle) {
          node.setAttribute('style', cleanedStyle);
        } else {
          node.removeAttribute('style');
        }
      }

      if (tagName === 'span' && !node.textContent?.trim() && !node.hasAttribute('style')) {
        node.replaceWith(...Array.from(node.childNodes));
      }

      if (tagName === 'p' && !node.textContent?.trim() && !node.querySelector('img')) {
        node.remove();
      }
    });

    return root.innerHTML.trim();
  } catch (error) {
    console.error('[WordEditor import sanitize]', error);
    return html;
  }
}

async function uploadBlogImage(file: File): Promise<string | null> {
  const body = new FormData();
  body.append('file', file);
  body.append('folder', 'Images_blogs');

  const response = await fetch('/api/upload', { method: 'POST', body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('[WordEditor upload]', data?.error || data?.details || response.status);
    return null;
  }

  if (!data?.success || !data.url || String(data.url).startsWith('data:')) {
    return null;
  }
  return String(data.url);
}

export default function WordEditor({
  content,
  onChange,
  locale = 'fr',
  onAddTag,
  enableSocialEmbed = false,
}: WordEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState('home');
  const [fontSize, setFontSize] = useState('11');
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[2].value);
  const [lineHeight, setLineHeight] = useState('1.5');
  const [isReadAlsoModalOpen, setIsReadAlsoModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isSocialEmbedModalOpen, setIsSocialEmbedModalOpen] = useState(false);
  const [socialEmbedPlatform, setSocialEmbedPlatform] = useState<SocialEmbedPlatform>('x');
  const [socialEmbedUrl, setSocialEmbedUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isTextColorPickerOpen, setIsTextColorPickerOpen] = useState(false);
  const [isHighlightColorPickerOpen, setIsHighlightColorPickerOpen] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const previousScrollY = useRef(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);
  const savedTextSelection = useRef<{ from: number; to: number } | null>(null);
  const insertImageFilesRef = useRef<(files: FileList | File[]) => Promise<void>>(async () => {});
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState<ArticleMediaKind | null>(null);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic',
          },
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      BackgroundColor,
      FontFamily,
      FontSize,
      LineHeight.configure({
        types: ['textStyle', 'paragraph', 'heading'],
      }),
      ImageWithCaption.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'article-inline-image',
        },
      }),
      MediaExtension,
      SocialEmbedExtension,
      ReadAlsoExtension,
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm min-w-0 max-w-none break-words focus:outline-none min-h-[760px] leading-relaxed text-[15px] sm:prose-base overflow-wrap-anywhere break-words',
      },
      handlePaste(_view, event) {
        const files = event.clipboardData?.files;
        if (files?.length) {
          const images = Array.from(files).filter(isImageFile);
          if (!images.length) return false;
          event.preventDefault();
          void insertImageFilesRef.current(images);
          return true;
        }

        const html = event.clipboardData?.getData('text/html');
        const plain = event.clipboardData?.getData('text/plain');

        if (html && html.trim()) {
          const cleaned = sanitizePastedHtml(html);
          if (cleaned && cleaned.replace(/<[^>]+>/g, '').trim()) {
            event.preventDefault();
            editor?.chain().focus().insertContent(cleaned).run();
            return true;
          }
        }

        if (plain && plain.trim()) {
          event.preventDefault();
          const normalized = plain
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

          const blocks = normalized
            .split('\n\n')
            .map((block) => {
              const escaped = block
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>');
              return `<p>${escaped}</p>`;
            })
            .join('');

          editor?.chain().focus().insertContent(blocks).run();
          return true;
        }

        return false;
      },
      handleDrop(_view, event) {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const images = Array.from(files).filter(isImageFile);
        if (!images.length) return false;
        event.preventDefault();
        void insertImageFilesRef.current(images);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      updateCounts(editor.getText());
      const attributes = editor.getAttributes('textStyle');
      setFontFamily(getFontFamilySelection(attributes.fontFamily));
      setFontSize(String(attributes.fontSize || '11px').replace(/px$/, ''));
    },
    onSelectionUpdate: ({ editor }) => {
      const attributes = editor.getAttributes('textStyle');
      setFontFamily(getFontFamilySelection(attributes.fontFamily));
      setFontSize(String(attributes.fontSize || '11px').replace(/px$/, ''));
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getHTML();
    const nextContent =
      typeof content === 'string'
        ? content
        : content && typeof content === 'object'
          ? content
          : '<p></p>';

    const shouldReplace =
      typeof nextContent === 'string'
        ? nextContent !== currentContent
        : JSON.stringify(nextContent) !== JSON.stringify(editor.getJSON());

    if (shouldReplace) {
      editor.commands.setContent(nextContent as any, { emitUpdate: false });
    }

    updateCounts(editor.getText());
  }, [editor, content]);

  const insertImageFiles = async (files: FileList | File[]) => {
    const images = Array.from(files).filter(isImageFile);
    if (!images.length || !editor) return;

    const currentEditor = editor;
    setUploadingInlineImage(true);
    try {
      for (const file of images) {
        const src = await uploadBlogImage(file);
        if (!src) {
          alert("Erreur lors de l'upload de l'image");
          continue;
        }

        const suggested = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
        const caption = window.prompt(
          "Description de l'image (légende affichée sous la photo) :",
          suggested
        );
        if (caption === null) continue;
        const text = caption.trim() || suggested;
        currentEditor.chain().focus().setImage({ src, alt: text }).updateAttributes('image', { caption: text, alt: text }).run();
      }
    } finally {
      setUploadingInlineImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  insertImageFilesRef.current = insertImageFiles;

  const uploadArticleMedia = async (file: File, kind: ArticleMediaKind) => {
    const response = await fetch('/api/upload/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        kind,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.uploadUrl || !data.url || !data.contentType) {
      throw new Error(data.error || 'Impossible de démarrer le transfert du média.');
    }

    await new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('PUT', data.uploadUrl);
      request.setRequestHeader('Content-Type', data.contentType);
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setMediaUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve();
        } else {
          reject(new Error(`Cloudflare R2 a refusé le média (${request.status}).`));
        }
      };
      request.onerror = () => {
        reject(new Error(
          'Échec de connexion au stockage. Vérifiez que le CORS du bucket R2 autorise PUT depuis le tableau de bord.',
        ));
      };
      request.onabort = () => reject(new Error('Transfert du média annulé.'));
      request.send(file);
    });

    return data.url as string;
  };

  const insertMediaFiles = async (files: FileList | File[], kind: ArticleMediaKind) => {
    if (!editor) return;
    setUploadingMedia(kind);
    setMediaUploadProgress(0);
    try {
      for (const file of Array.from(files)) {
        const src = await uploadArticleMedia(file, kind);
        const title = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
        editor.chain().focus().insertArticleMedia({ kind, src, title }).run();
      }
    } catch (error) {
      console.error('[WordEditor media upload]', error);
      window.alert(error instanceof Error ? error.message : 'Échec de l’upload du média.');
    } finally {
      setUploadingMedia(null);
      setMediaUploadProgress(0);
      if (kind === 'audio' && audioInputRef.current) audioInputRef.current.value = '';
      if (kind === 'video' && videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 1024 || !toolbarRef.current) return;

      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < previousScrollY.current;
      const toolbarReachedTop = toolbarRef.current.getBoundingClientRect().top <= 56;

      window.dispatchEvent(new CustomEvent('editor-toolbar-visibility', {
        detail: window.scrollY > 0 && scrollingUp && toolbarReachedTop,
      }));
      previousScrollY.current = currentScrollY;
    };

    previousScrollY.current = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.dispatchEvent(new CustomEvent('editor-toolbar-visibility', { detail: false }));
    };
  }, []);

  const updateCounts = (text: string) => {
    const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(200, Math.max(50, prev + delta)));
  };

  const handleInsertReadAlso = (title: string, url: string, accentColor?: string) => {
    if (editor) {
      editor.chain().focus().insertReadAlso({ title, url, accentColor }).run();
    }
  };

  const handleInsertSocialEmbed = () => {
    if (!editor) return;
    const embed = normalizeSocialEmbed(socialEmbedPlatform, socialEmbedUrl);
    if (!embed) {
      const errorMessage: Record<SocialEmbedPlatform, string> = {
        x: 'Collez le lien d’une publication X contenant /status/ suivi de son identifiant.',
        facebook: 'Collez le lien d’une publication Facebook (post, photo ou vidéo).',
        youtube: 'Collez le lien d’une vidéo YouTube (youtube.com ou youtu.be).',
        linkedin: 'Collez le lien public d’une publication LinkedIn contenant son identifiant de publication.',
      };
      window.alert(errorMessage[socialEmbedPlatform]);
      return;
    }

    editor.chain().focus().insertSocialEmbed({ platform: embed.platform, url: embed.url }).run();
    setSocialEmbedUrl('');
    setIsSocialEmbedModalOpen(false);
  };

  const handleSetLink = () => {
    if (editor && linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setIsLinkModalOpen(false);
    }
  };

  const handleUnsetLink = () => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  };

  const handleTagSelection = () => {
    if (!editor) return;

    const { from, to, empty } = editor.state.selection;
    if (empty) {
      window.alert('Sélectionnez un nom dans le texte, par exemple Félix Tshisekedi.');
      return;
    }

    const selected = cleanTagName(
      editor.state.doc.textBetween(from, to, ' ').replace(/\s+/g, ' ')
    );

    if (selected.length < 2) return;

    onAddTag?.(selected);
    const slug = slugifyTag(selected);
    if (!slug) return;

    const localeSafe = (locale || 'fr').replace(/[^a-z-]/gi, '') || 'fr';
    editor.chain().focus().setLink({ href: `/${localeSafe}/tag/${slug}` }).run();
  };

  const handleImageCaption = () => {
    if (!editor || !editor.isActive('image')) {
      window.alert("Sélectionnez une image dans le texte pour ajouter sa description.");
      return;
    }

    const attrs = editor.getAttributes('image') as { alt?: string; caption?: string };
    const next = window.prompt(
      "Description de l'image (légende sous la photo) :",
      attrs.caption || attrs.alt || ''
    );
    if (next === null) return;
    const text = next.trim();
    editor.chain().focus().updateAttributes('image', { caption: text, alt: text }).run();
  };

  const handleTextColorChange = (color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
      setTextColor(color);
      setIsTextColorPickerOpen(false);
    }
  };

  const handleHighlightColorChange = (color: string) => {
    if (editor) {
      editor.chain().focus().setBackgroundColor(color).run();
      setHighlightColor(color);
      setIsHighlightColorPickerOpen(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    if (!editor) return;

    try {
      const clipboard = navigator.clipboard;
      let pastedContent = '';

      if (typeof clipboard.read === 'function') {
        const items = await clipboard.read();
        const htmlItem = items.find((item) => item.types.includes('text/html'));
        if (htmlItem) {
          pastedContent = await (await htmlItem.getType('text/html')).text();
        } else {
          const textItem = items.find((item) => item.types.includes('text/plain'));
          if (textItem) {
            pastedContent = await (await textItem.getType('text/plain')).text();
          }
        }
      } else {
        pastedContent = await clipboard.readText();
      }

      if (pastedContent) {
        const sanitized = sanitizePastedHtml(pastedContent);
        editor.chain().focus().insertContent(sanitized || pastedContent).run();
      }
    } catch (error) {
      console.error('[WordEditor paste]', error);
      window.alert("Impossible d'accéder au presse-papiers. Utilisez Ctrl+V dans l'éditeur.");
    }
  };

  const handleWordImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isDocx =
      file.name.toLowerCase().endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isDocx) {
      alert('Sélectionne un fichier Word (.docx).');
      if (wordInputRef.current) wordInputRef.current.value = '';
      return;
    }

    if (!editor) {
      if (wordInputRef.current) wordInputRef.current.value = '';
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const importedHtml = normalizeImportedWordHtml(result.value || '');

      if (!importedHtml.trim()) {
        alert('Aucun contenu exploitable n’a été trouvé dans ce document Word.');
        return;
      }

      editor.chain().focus().setContent(importedHtml, { emitUpdate: true }).run();
    } catch (error) {
      console.error('[WordEditor import]', error);
      alert("Impossible d'importer ce fichier Word. Vérifie qu'il s'agit bien d'un fichier .docx valide.");
    } finally {
      if (wordInputRef.current) wordInputRef.current.value = '';
    }
  };

  const applyFontFamily = (value: string) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (savedTextSelection.current) {
      chain.setTextSelection(savedTextSelection.current);
    }
    chain.setFontFamily(value).run();
    savedTextSelection.current = null;
  };

  const applyFontSize = (value: string) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (savedTextSelection.current) {
      chain.setTextSelection(savedTextSelection.current);
    }
    chain.setFontSize(`${value}px`).run();
    savedTextSelection.current = null;
  };

  const rememberTextSelection = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    savedTextSelection.current = { from, to };
  };

  if (!editor) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="relative isolate w-full min-w-0 overflow-hidden rounded-xl border border-[#d9d9d7] bg-[#f3f3f1] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
      <div ref={toolbarRef} className="sticky top-0 z-50 w-full min-w-0 overflow-x-auto border-b border-[#d5d2ce] bg-[#f7f6f4] shadow-[0_1px_0_rgba(15,23,42,0.06)]">
        <div className="flex min-w-max border-b border-[#e6e2dd] bg-[#f3f1ee]">
          {['home', 'insert', 'layout'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`min-w-[96px] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors sm:min-w-[120px] sm:px-5 sm:text-xs ${
                activeTab === tab
                  ? 'border-b-2 border-[#2563eb] bg-white text-[#0f172a]'
                  : 'text-[#475569] hover:bg-white/70'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid w-full min-w-0">
          <div
            aria-hidden={activeTab !== 'home'}
            className={`col-start-1 row-start-1 min-w-0 overflow-x-auto p-2 ${
              activeTab === 'home' ? 'visible' : 'invisible'
            }`}
          >
            <div className="flex min-w-max items-center gap-1 bg-gradient-to-b from-gray-50 to-white">
              <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="rounded p-2 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Annuler (Ctrl+Z)"
                  aria-label="Annuler"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="rounded p-2 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Rétablir (Ctrl+Y)"
                  aria-label="Rétablir"
                >
                  <Redo2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void handlePasteFromClipboard()}
                  className="rounded p-2 transition-colors hover:bg-blue-100"
                  title="Coller"
                >
                  <Clipboard className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('cut')}
                  className="rounded p-2 transition-colors hover:bg-blue-100"
                  title="Couper"
                >
                  <Scissors className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('copy')}
                  className="rounded p-2 transition-colors hover:bg-blue-100"
                  title="Copier"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                <select
                  className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-blue-50 sm:text-sm"
                  title="Police"
                  value={fontFamily}
                  onMouseDown={rememberTextSelection}
                  onFocus={rememberTextSelection}
                  onChange={(event) => {
                    setFontFamily(event.target.value);
                    applyFontFamily(event.target.value);
                  }}
                >
                  {!FONT_FAMILIES.some((family) => family.value === fontFamily) && (
                    <option value={fontFamily}>{fontFamily}</option>
                  )}
                  {FONT_FAMILIES.map((family) => (
                    <option key={family.value} value={family.value} style={{ fontFamily: family.value }}>
                      {family.label}
                    </option>
                  ))}
                </select>
                <select
                  className="w-14 rounded border border-gray-300 px-1 py-1 text-xs hover:bg-blue-50 sm:w-16 sm:text-sm"
                  title="Taille"
                  value={fontSize}
                  onMouseDown={rememberTextSelection}
                  onFocus={rememberTextSelection}
                  onChange={(event) => {
                    setFontSize(event.target.value);
                    applyFontSize(event.target.value);
                  }}
                >
                  {!FONT_SIZES.includes(fontSize) && <option value={fontSize}>{fontSize}</option>}
                  {FONT_SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`rounded p-2 ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                    title="Gras (Ctrl+B)"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`rounded p-2 ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                    title="Italique (Ctrl+I)"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`rounded p-2 ${editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                    title="Barré"
                  >
                    <Strikethrough className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`rounded p-2 ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                    title="Souligné (Ctrl+U)"
                  >
                    <UnderlineIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(true)}
                  className={`rounded p-2 ${editor.isActive('link') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Insérer un lien"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleUnsetLink}
                  className="rounded p-2 transition-colors hover:bg-blue-100"
                  title="Supprimer le lien"
                >
                  <Unlink className="h-4 w-4" />
                </button>
                {onAddTag && (
                  <button
                    type="button"
                    onClick={handleTagSelection}
                    className="rounded p-2 transition-colors hover:bg-blue-100"
                    title="Taguer la sélection"
                  >
                    <Hash className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingInlineImage}
                  className="rounded p-2 transition-colors hover:bg-blue-100 disabled:opacity-50"
                  title="Insérer une image"
                >
                  {uploadingInlineImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleImageCaption}
                  className={`rounded p-2 ${editor.isActive('image') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Description / légende de l'image"
                >
                  <FileText className="h-4 w-4" />
                </button>
              </div>

              <div className="relative flex items-center gap-1 border-r border-gray-300 pr-2">
                <button
                  type="button"
                  onClick={() => setIsTextColorPickerOpen(!isTextColorPickerOpen)}
                  className="relative rounded p-2 transition-colors hover:bg-blue-100"
                  title="Couleur du texte"
                >
                  <Type className="h-4 w-4" />
                  <div
                    className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white"
                    style={{ backgroundColor: textColor }}
                  />
                </button>
                {isTextColorPickerOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 rounded border border-gray-300 bg-white p-2 shadow-lg">
                    <div className="grid grid-cols-5 gap-1">
                      {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#008800'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleTextColorChange(color)}
                          className="h-6 w-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => handleTextColorChange(e.target.value)}
                      className="mt-2 h-8 w-full cursor-pointer"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsHighlightColorPickerOpen(!isHighlightColorPickerOpen)}
                  className="relative rounded p-2 transition-colors hover:bg-blue-100"
                  title="Couleur de surbrillance"
                >
                  <Palette className="h-4 w-4" />
                  <div
                    className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white"
                    style={{ backgroundColor: highlightColor }}
                  />
                </button>
                {isHighlightColorPickerOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 rounded border border-gray-300 bg-white p-2 shadow-lg">
                    <div className="grid grid-cols-5 gap-1">
                      {['#ffff00', '#00ffff', '#ff00ff', '#ff8800', '#88ff00', '#ffffff', '#cccccc', '#ffcccc', '#ccffcc', '#ccccff'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleHighlightColorChange(color)}
                          className="h-6 w-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={highlightColor}
                      onChange={(e) => handleHighlightColorChange(e.target.value)}
                      className="mt-2 h-8 w-full cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  className={`rounded p-2 ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Aligner à gauche"
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  className={`rounded p-2 ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Centrer"
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  className={`rounded p-2 ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Aligner à droite"
                >
                  <AlignRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                  className={`rounded p-2 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Justifier"
                >
                  <AlignJustify className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`rounded p-2 ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Liste à puces"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`rounded p-2 ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Liste numérotée"
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 pr-2">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
                  className="rounded p-2 transition-colors hover:bg-blue-100"
                  title="Augmenter le retrait"
                >
                  <Indent className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().liftListItem('listItem').run()}
                  className="rounded p-2 transition-colors hover:bg-blue-100"
                  title="Diminuer le retrait"
                >
                  <IndentDecrease className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <select
                  className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-blue-50 sm:text-sm"
                  title="Interligne"
                  value={lineHeight}
                  onChange={(event) => {
                    const value = event.target.value;
                    setLineHeight(value);
                    const blockType = editor.isActive('heading') ? 'heading' : 'paragraph';
                    editor.chain().focus().updateAttributes(blockType, { lineHeight: value }).run();
                  }}
                >
                  <option value="1.0">1.0</option>
                  <option value="1.15">1.15</option>
                  <option value="1.5">1.5</option>
                  <option value="2.0">2.0</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  className={`rounded px-2 py-1 text-xs ${editor.isActive('paragraph') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors sm:px-3 sm:text-sm`}
                  title="Normal"
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`rounded px-2 py-1 text-xs font-bold ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors sm:px-3 sm:text-sm`}
                  title="Titre 1"
                >
                  <Heading1 className="inline h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`rounded px-2 py-1 text-xs font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors sm:px-3 sm:text-sm`}
                  title="Titre 2"
                >
                  <Heading2 className="inline h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`rounded px-2 py-1 text-xs font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors sm:px-3 sm:text-sm`}
                  title="Titre 3"
                >
                  <Heading3 className="inline h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`rounded px-2 py-1 text-xs ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors sm:px-3 sm:text-sm`}
                  title="Citation"
                >
                  <Quote className="inline h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            aria-hidden={activeTab !== 'insert'}
            className={`col-start-1 row-start-1 min-w-0 overflow-x-auto p-2 ${
              activeTab === 'insert' ? 'visible' : 'invisible'
            }`}
          >
            <div className="flex min-w-max items-center gap-2 bg-gradient-to-b from-gray-50 to-white">
              <button
                type="button"
                onClick={() => setIsReadAlsoModalOpen(true)}
                className="flex items-center gap-2 rounded p-2 transition-colors hover:bg-blue-100"
                title="Insérer un article recommandé"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-xs sm:text-sm">À lire aussi</span>
              </button>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingInlineImage}
                className="flex items-center gap-2 rounded p-2 transition-colors hover:bg-blue-100 disabled:opacity-50"
                title="Insérer une image"
              >
                {uploadingInlineImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                <span className="text-xs sm:text-sm">{uploadingInlineImage ? 'Envoi…' : 'Image'}</span>
              </button>
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                disabled={uploadingMedia !== null}
                className="flex items-center gap-2 rounded p-2 transition-colors hover:bg-blue-100 disabled:opacity-50"
                title="Insérer un audio"
              >
                {uploadingMedia === 'audio' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music2 className="h-4 w-4" />}
                <span className="text-xs sm:text-sm">{uploadingMedia === 'audio' ? 'Envoi…' : 'Audio'}</span>
              </button>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingMedia !== null}
                className="flex items-center gap-2 rounded p-2 transition-colors hover:bg-blue-100 disabled:opacity-50"
                title="Insérer une vidéo MP4, WebM ou OGG (100 Mo maximum)"
              >
                {uploadingMedia === 'video' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                <span className="text-xs sm:text-sm">
                  {uploadingMedia === 'video' ? `Vidéo ${mediaUploadProgress}%` : 'Vidéo'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => wordInputRef.current?.click()}
                className="flex items-center gap-2 rounded p-2 transition-colors hover:bg-blue-100"
                title="Importer un document Word"
              >
                <FileText className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Word</span>
              </button>
              <button
                type="button"
                onClick={handleImageCaption}
                className="flex items-center gap-2 rounded p-2 transition-colors hover:bg-blue-100"
                title="Description / légende de l'image"
              >
                <FileText className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Légende</span>
              </button>
              {enableSocialEmbed && (
                <button
                  type="button"
                  onClick={() => setIsSocialEmbedModalOpen(true)}
                  className="flex items-center gap-2 rounded p-2 transition-colors hover:bg-blue-100"
                  title="Intégrer une publication / vidéo"
                >
                  <Code2 className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Publication / vidéo</span>
                </button>
              )}
              {onAddTag && (
                <button
                  type="button"
                  onClick={handleTagSelection}
                  className="flex items-center gap-2 rounded p-2 transition-colors hover:bg-blue-100"
                  title="Taguer la sélection"
                >
                  <Hash className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Taguer</span>
                </button>
              )}
              <button type="button" className="rounded p-2 transition-colors hover:bg-blue-100" title="Insérer un lien">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            aria-hidden={activeTab !== 'layout'}
            className={`col-start-1 row-start-1 min-w-0 overflow-x-auto p-2 ${
              activeTab === 'layout' ? 'visible' : 'invisible'
            }`}
          >
            <div className="flex min-w-max items-center gap-2 bg-gradient-to-b from-gray-50 to-white">
              <button type="button" className="rounded p-2 transition-colors hover:bg-blue-100" title="Orientation">
                <FileText className="h-4 w-4" />
              </button>
              <button type="button" className="rounded p-2 transition-colors hover:bg-blue-100" title="Marges">
                <FileText className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-6 items-center border-b border-[#c9c7c4] bg-[#dfe0df] px-4">
        <div className="flex flex-1 items-center gap-1">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="h-3 w-px bg-[#8a8a88]" />
          ))}
        </div>
      </div>

      <div className="overflow-x-auto bg-[#f4f4f3] p-3 sm:p-6 lg:p-8" style={{ minHeight: '600px' }}>
        <div
          className="mx-auto min-h-[900px] max-w-full bg-white p-4 shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.08)] sm:p-8 lg:p-12"
          style={{
            width: '100%',
            maxWidth: '1500px',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }}
        >
          <EditorContent
            editor={editor}
            className="min-w-0 max-w-none break-words overflow-x-hidden text-[15px] leading-relaxed focus:outline-none sm:prose-base"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-[#1f2937] px-4 py-2 text-xs text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {wordCount} mots
          </span>
          <span>{charCount} caractères</span>
          <span className="flex items-center gap-1">
            <Type className="h-3 w-3" />
            Français (France)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleZoom(-10)}
            className="rounded p-1 hover:bg-gray-700"
            title="Zoom arrière"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-12 text-center">{zoom}%</span>
          <button
            type="button"
            onClick={() => handleZoom(10)}
            className="rounded p-1 hover:bg-gray-700"
            title="Zoom avant"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ReadAlsoModal
        isOpen={isReadAlsoModalOpen}
        onClose={() => setIsReadAlsoModalOpen(false)}
        onInsert={handleInsertReadAlso}
      />

      {isSocialEmbedModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="social-embed-title"
            className="w-full max-w-lg rounded-lg bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 id="social-embed-title" className="text-lg font-semibold text-gray-900">
                Intégrer une publication
              </h2>
              <button
                type="button"
                onClick={() => setIsSocialEmbedModalOpen(false)}
                className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <label htmlFor="social-embed-platform" className="mb-1 block text-sm font-medium text-gray-700">
                  Réseau social ou vidéo
                </label>
                <select
                  id="social-embed-platform"
                  value={socialEmbedPlatform}
                  onChange={(event) => setSocialEmbedPlatform(event.target.value as SocialEmbedPlatform)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="x">X (Twitter)</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
              <div>
                <label htmlFor="social-embed-url" className="mb-1 block text-sm font-medium text-gray-700">
                  Lien de la publication
                </label>
                <input
                  id="social-embed-url"
                  type="url"
                  value={socialEmbedUrl}
                  onChange={(event) => setSocialEmbedUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleInsertSocialEmbed();
                    }
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder={
                    {
                      x: 'https://x.com/compte/status/123456789',
                      facebook: 'https://www.facebook.com/page/posts/123456789',
                      youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                      linkedin: 'https://www.linkedin.com/posts/compte_activity-123456789',
                    }[socialEmbedPlatform]
                  }
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500">
                  Collez le lien public de la publication ou de la vidéo. Pour LinkedIn, l’identifiant de la publication doit être présent dans le lien.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 p-4">
              <button
                type="button"
                onClick={() => setIsSocialEmbedModalOpen(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleInsertSocialEmbed}
                disabled={!socialEmbedUrl.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Insérer la publication
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) {
            void insertImageFiles(event.target.files);
          }
        }}
      />

      <input
        ref={audioInputRef}
        type="file"
        accept="audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/mp4,audio/webm,.mp3,.wav,.ogg,.oga,.aac,.m4a"
        className="hidden"
        disabled={uploadingMedia !== null}
        onChange={(event) => {
          if (event.target.files?.length) {
            void insertMediaFiles(event.target.files, 'audio');
          }
        }}
      />

      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogv"
        className="hidden"
        disabled={uploadingMedia !== null}
        onChange={(event) => {
          if (event.target.files?.length) {
            void insertMediaFiles(event.target.files, 'video');
          }
        }}
      />

      <input
        ref={wordInputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleWordImport}
      />

      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Insérer un lien</h2>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-2 text-gray-400 transition-colors hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">URL du lien</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="https://..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSetLink();
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSetLink}
                disabled={!linkUrl}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Insérer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
