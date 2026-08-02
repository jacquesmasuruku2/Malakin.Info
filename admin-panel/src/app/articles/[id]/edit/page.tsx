'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, X } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  authorId: string | null;
  publishedAt: string;
  featured: boolean;
  readTime: string | null;
  mainImageUrl: string | null;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [categories, setCategories] = useState<{id: string, title: string}[]>([]);
  const [authors, setAuthors] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categoryId: '',
    authorId: '',
    publishedAt: '',
    featured: false,
    readTime: '',
    mainImageUrl: '',
  });

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`article-draft-${articleId}`, JSON.stringify(formData));
      setAutoSaving(true);
      setTimeout(() => setAutoSaving(false), 1000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, articleId]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData({ ...formData, content: editor.getHTML() });
    },
  });

  useEffect(() => {
    fetchArticle();
    fetchCategories();
    fetchAuthors();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}`);
      const data: Article = await response.json();
      setFormData({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content),
        categoryId: data.categoryId,
        authorId: data.authorId || '',
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().split('T')[0] : '',
        featured: data.featured,
        readTime: data.readTime || '',
        mainImageUrl: data.mainImageUrl || '',
      });
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/authors');
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.error('Failed to fetch authors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Clear draft on successful save
        localStorage.removeItem(`article-draft-${articleId}`);
        router.push('/articles');
      } else {
        alert('Erreur lors de la modification de l\'article');
      }
    } catch (error) {
      console.error('Failed to update article:', error);
      alert('Erreur lors de la modification de l\'article');
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({ ...formData, title, slug: generateSlug(title) });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">En cours de chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier l'article</h1>
            <p className="text-gray-600 mt-1">Modifier l'article existant</p>
            {autoSaving && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                Brouillon enregistré automatiquement
              </p>
            )}
          </div>
          <button
            onClick={() => router.push('/articles')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Annuler</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Titre de l'article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="url-de-l-article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extrait *
            </label>
            <textarea
              required
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Brève description de l'article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenu *
            </label>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              {/* Toolbar - Word 365 style */}
              <div className="bg-gray-50 border-b border-gray-300 p-2">
                <div className="flex flex-wrap gap-1 items-center">
                  {/* Text formatting */}
                  <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="Gras"
                    >
                      <strong className="text-sm">B</strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="Italique"
                    >
                      <em className="text-sm">I</em>
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleStrike().run()}
                      className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('strike') ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="Barré"
                    >
                      <s className="text-sm">S</s>
                    </button>
                  </div>

                  {/* Headings */}
                  <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={`px-3 py-2 rounded hover:bg-gray-200 text-sm font-bold ${editor?.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="Titre 1"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={`px-3 py-2 rounded hover:bg-gray-200 text-sm font-bold ${editor?.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="Titre 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={`px-3 py-2 rounded hover:bg-gray-200 text-sm font-bold ${editor?.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="Titre 3"
                    >
                      H3
                    </button>
                  </div>

                  {/* Lists */}
                  <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="Liste à puces"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                      className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="Liste numérotée"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z"/>
                      </svg>
                    </button>
                  </div>

                </div>
              </div>
              
              {/* Editor content area */}
              <div className="bg-white min-h-[400px]">
                <EditorContent editor={editor} className="prose prose-sm sm:prose-base max-w-none p-6 focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auteur
              </label>
              <select
                value={formData.authorId}
                onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Sélectionner un auteur</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de publication
              </label>
              <input
                type="date"
                value={formData.publishedAt}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temps de lecture (minutes)
              </label>
              <input
                type="number"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de l'image principale (Cloudinary, Imgur, ImgBB, etc.)
            </label>
            <input
              type="url"
              value={formData.mainImageUrl}
              onChange={(e) => setFormData({ ...formData, mainImageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="https://res.cloudinary.com/your-cloud/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Collez l'URL de votre image hébergée sur Cloudinary, Imgur, ImgBB ou tout autre service d'hébergement d'images.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="featured" className="text-sm text-gray-700">
              Article à la une
            </label>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/articles')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
