import mammoth from 'mammoth';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
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
  Loader2,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table as TableIcon,
  ExternalLink,
  Link as LinkIcon,
  Unlink,
  Hash,
  X,
  Undo2,
  Redo2
} from 'lucide-react';
