'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState, useEffect } from 'react';
import { 
  Scissors, 
  Copy, 
  Clipboard, 
  Bold, 
  Italic, 
  Underline, 
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
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table
} from 'lucide-react';

interface WordEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function WordEditor({ content, onChange }: WordEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState('home');

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      updateCounts(editor.getText());
    },
  });

  useEffect(() => {
    if (editor) {
      updateCounts(editor.getText());
    }
  }, [editor]);

  const updateCounts = (text: string) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(200, Math.max(50, prev + delta)));
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
      {/* Ribbon Toolbar */}
      <div className="bg-white border-b border-gray-300">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {['home', 'insert', 'layout'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Home Tab Content */}
        {activeTab === 'home' && (
          <div className="p-2 flex flex-wrap gap-1 items-center bg-gradient-to-b from-gray-50 to-white">
            {/* Clipboard Group */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
              <button
                onClick={() => navigator.clipboard.readText().then(text => editor.chain().focus().insertContent(text).run())}
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Coller"
              >
                <Clipboard className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.execCommand('cut')}
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Couper"
              >
                <Scissors className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.execCommand('copy')}
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Copier"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Font Group */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
              <select
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-blue-50"
                title="Police"
              >
                <option>Calibri</option>
                <option>Arial</option>
                <option>Inter</option>
                <option>Times New Roman</option>
              </select>
              <select
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-blue-50 w-16"
                title="Taille"
              >
                <option>8</option>
                <option>9</option>
                <option>10</option>
                <option selected>11</option>
                <option>12</option>
                <option>14</option>
                <option>16</option>
                <option>18</option>
                <option>20</option>
                <option>24</option>
              </select>
              <div className="flex gap-1">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Gras (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Italique (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`p-2 rounded ${editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Barré"
                >
                  <Strikethrough className="w-4 h-4" />
                </button>
                <button
                  className="p-2 hover:bg-blue-100 rounded transition-colors"
                  title="Souligné (Ctrl+U)"
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-1">
                <button
                  className="p-1 hover:bg-blue-100 rounded transition-colors text-xs font-bold"
                  title="Indice"
                >
                  x₂
                </button>
                <button
                  className="p-1 hover:bg-blue-100 rounded transition-colors text-xs font-bold"
                  title="Exposant"
                >
                  x²
                </button>
              </div>
              <div className="flex gap-1">
                <button
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                  title="Couleur du texte"
                >
                  <Type className="w-4 h-4" />
                </button>
                <button
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                  title="Couleur de surbrillance"
                >
                  <Palette className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Paragraph Group */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
              <button
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Aligner à gauche"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Centrer"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Aligner à droite"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Justifier"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Liste à puces"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Liste numérotée"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
              <button
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Augmenter le retrait"
              >
                <Indent className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Diminuer le retrait"
              >
                <IndentDecrease className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <select
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-blue-50"
                title="Interligne"
              >
                <option>1.0</option>
                <option>1.15</option>
                <option selected>1.5</option>
                <option>2.0</option>
              </select>
            </div>

            {/* Styles Group */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`px-3 py-1 text-sm rounded ${editor.isActive('paragraph') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Normal"
              >
                Normal
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-3 py-1 text-sm font-bold rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Titre 1"
              >
                <Heading1 className="w-4 h-4 inline" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-3 py-1 text-sm font-bold rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Titre 2"
              >
                <Heading2 className="w-4 h-4 inline" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-3 py-1 text-sm font-bold rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Titre 3"
              >
                <Heading3 className="w-4 h-4 inline" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`px-3 py-1 text-sm rounded ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Citation"
              >
                <Quote className="w-4 h-4 inline" />
              </button>
            </div>
          </div>
        )}

        {/* Insert Tab */}
        {activeTab === 'insert' && (
          <div className="p-2 flex gap-2 items-center bg-gradient-to-b from-gray-50 to-white">
            <button className="p-2 hover:bg-blue-100 rounded transition-colors" title="Insérer une image">
              <FileText className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-blue-100 rounded transition-colors" title="Insérer un lien">
              <Search className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="p-2 flex gap-2 items-center bg-gradient-to-b from-gray-50 to-white">
            <button className="p-2 hover:bg-blue-100 rounded transition-colors" title="Orientation">
              <FileText className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-blue-100 rounded transition-colors" title="Marges">
              <FileText className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Ruler */}
      <div className="bg-gray-200 h-6 border-b border-gray-300 flex items-center px-4">
        <div className="flex-1 flex items-center gap-1">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-px h-3 bg-gray-400"></div>
          ))}
        </div>
      </div>

      {/* Editor Page */}
      <div className="bg-gray-100 p-8 overflow-auto" style={{ minHeight: '600px' }}>
        <div 
          className="bg-white shadow-lg mx-auto max-w-4xl min-h-[800px] p-12"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center'
          }}
        >
          <EditorContent editor={editor} className="prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[700px]" />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {wordCount} mots
          </span>
          <span>{charCount} caractères</span>
          <span className="flex items-center gap-1">
            <Type className="w-3 h-3" />
            Français (France)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(-10)}
            className="p-1 hover:bg-gray-700 rounded"
            title="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="w-12 text-center">{zoom}%</span>
          <button
            onClick={() => handleZoom(10)}
            className="p-1 hover:bg-gray-700 rounded"
            title="Zoom avant"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
