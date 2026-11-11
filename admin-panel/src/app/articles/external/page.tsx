'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useState } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ImportedArticle = {
  title: string;
  excerpt: string;
  imageUrl: string | null;
  author: string;
  publishedAt: string;
  content: string;
  originalUrl: string;
};

type CategoryOption = { id: string; title: string };
type AuthorOption = { id: string; name: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

export default function ExternalArticlePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [importedArticle, setImportedArticle] = useState<ImportedArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Article metadata for saving
  const [articleData, setArticleData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    categoryId: '',
    authorId: '',
  });
  
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [authors, setAuthors] = useState<AuthorOption[]>([]);

  const fetchArticle = async () => {
    if (!url.trim()) {
      setError('Veuillez entrer une URL');
      return;
    }

    setLoading(true);
    setError('');
    setImportedArticle(null);

    try {
      const response = await fetch('/api/proxy-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error
          || (response.status === 401
            ? 'Votre session administrateur a expiré. Reconnectez-vous puis réessayez.'
            : `Erreur lors de la récupération de l’article (HTTP ${response.status}).`),
        );
      }

      if (
        typeof data.content !== 'string'
        || !data.content.trim()
        || typeof data.originalUrl !== 'string'
      ) {
        throw new Error('Aucun contenu éditorial exploitable n’a été trouvé sur cette page.');
      }
      const article: ImportedArticle = {
        title: typeof data.title === 'string' ? data.title : '',
        excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
        imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : null,
        author: typeof data.author === 'string' ? data.author : '',
        publishedAt: typeof data.publishedAt === 'string' ? data.publishedAt : '',
        content: data.content,
        originalUrl: data.originalUrl,
      };
      setImportedArticle(article);
      const title = article.title || new URL(article.originalUrl).hostname;
      setArticleData(prev => ({
        ...prev,
        title,
        slug: slugify(title) || slugify(new URL(article.originalUrl).pathname.split('/').pop() || 'article'),
        excerpt: article.excerpt,
      }));
      
      // Fetch categories and authors for the save form
      fetchCategories();
      fetchAuthors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data: unknown = await response.json();
      if (!response.ok || !Array.isArray(data)) {
        throw new Error('Impossible de charger les catégories.');
      }
      setCategories(data.filter((item): item is CategoryOption => (
        isRecord(item) && typeof item.id === 'string' && typeof item.title === 'string'
      )));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/authors');
      const data: unknown = await response.json();
      if (!response.ok || !Array.isArray(data)) {
        throw new Error('Impossible de charger les auteurs.');
      }
      setAuthors(data.filter((item): item is AuthorOption => (
        isRecord(item) && typeof item.id === 'string' && typeof item.name === 'string'
      )));
    } catch (err) {
      console.error('Failed to fetch authors:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticle();
  };

  const handleSave = async () => {
    if (!importedArticle) {
      setError('Chargez un article externe avant de l’enregistrer.');
      return;
    }
    if (!articleData.title || !articleData.slug || !articleData.categoryId) {
      setError('Veuillez remplir le titre, le slug et la catégorie');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const sourceHost = new URL(importedArticle.originalUrl).hostname;
      const sourceAttribution = [
        `Source : <a href="${escapeHtml(importedArticle.originalUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sourceHost)}</a>`,
        importedArticle.author ? `— ${escapeHtml(importedArticle.author)}` : '',
      ].filter(Boolean).join(' ');
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...articleData,
          content: `${importedArticle.content}<p><strong>${sourceAttribution}</strong></p>`,
          publishedAt: new Date().toISOString(),
          mainImageUrl: importedArticle.imageUrl,
          mainImageAlt: articleData.title,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'enregistrement');
      }

      const savedArticle = await response.json();
      router.push(`/articles/${savedArticle.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/articles"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-primary">Article Externe</h1>
                <p className="text-secondary mt-1">Afficher le contenu d&apos;un article depuis une URL externe</p>
              </div>
            </div>
          </div>

          {/* URL Input */}
          <div className="card rounded-lg shadow-sm border p-6">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://articles.rfi.fr/fr/..."
                aria-describedby="external-article-url-help"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Charger
                  </>
                )}
              </button>
            </form>
            <p id="external-article-url-help" className="mt-3 text-sm text-gray-600">
              Utilisez une URL HTTP ou HTTPS dont le domaine pointe uniquement vers des adresses IP publiques. Les adresses locales ou privées ne sont pas autorisées.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Article Content */}
          {importedArticle && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowSaveForm(!showSaveForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {showSaveForm ? 'Masquer le formulaire' : 'Enregistrer comme article'}
                </button>
              </div>

              {/* Save Form */}
              {showSaveForm && (
                <div className="card rounded-lg shadow-sm border p-6 mb-4">
                  <h3 className="text-lg font-semibold text-primary mb-4">Enregistrer comme article</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre *
                      </label>
                      <input
                        type="text"
                        value={articleData.title}
                        onChange={(e) => setArticleData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Titre de l'article"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug *
                      </label>
                      <input
                        type="text"
                        value={articleData.slug}
                        onChange={(e) => setArticleData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="url-de-l-article"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Extrait
                      </label>
                      <textarea
                        value={articleData.excerpt}
                        onChange={(e) => setArticleData(prev => ({ ...prev, excerpt: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        rows={3}
                        placeholder="Brève description de l'article"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catégorie *
                      </label>
                      <select
                        value={articleData.categoryId}
                        onChange={(e) => setArticleData(prev => ({ ...prev, categoryId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Auteur
                      </label>
                      <select
                        value={articleData.authorId}
                        onChange={(e) => setArticleData(prev => ({ ...prev, authorId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Sélectionner un auteur</option>
                        {authors.map((author) => (
                          <option key={author.id} value={author.id}>{author.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Enregistrer
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowSaveForm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <article className="card mx-auto max-w-4xl overflow-hidden rounded-xl border bg-white shadow-sm">
                {importedArticle.imageUrl && (
                  <img
                    src={importedArticle.imageUrl}
                    alt={importedArticle.title}
                    className="aspect-video w-full object-cover"
                  />
                )}
                <div className="p-6 sm:p-10">
                  <a
                    href={importedArticle.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
                  >
                    Source originale : {new URL(importedArticle.originalUrl).hostname}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <h2 className="mt-4 font-heading text-3xl font-black leading-tight text-primary sm:text-4xl">
                    {importedArticle.title}
                  </h2>
                  {importedArticle.excerpt && (
                    <p className="mt-4 text-lg leading-relaxed text-gray-600">
                      {importedArticle.excerpt}
                    </p>
                  )}
                  {(importedArticle.author || importedArticle.publishedAt) && (
                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-b pb-5 text-sm text-gray-500">
                      {importedArticle.author && <span>Par {importedArticle.author}</span>}
                      {importedArticle.publishedAt && (
                        <time dateTime={importedArticle.publishedAt}>
                              {Number.isNaN(Date.parse(importedArticle.publishedAt))
                                ? importedArticle.publishedAt
                                : new Date(importedArticle.publishedAt).toLocaleDateString('fr-FR')}
                        </time>
                      )}
                    </div>
                  )}
                  <div
                    className="prose prose-lg mt-8 max-w-none break-words leading-relaxed prose-headings:font-bold prose-headings:text-primary prose-a:text-blue-700 prose-img:mx-auto prose-img:h-auto prose-img:max-w-full prose-img:rounded-lg prose-blockquote:border-l-4 prose-blockquote:border-blue-700 prose-figcaption:text-sm prose-figcaption:italic"
                    dangerouslySetInnerHTML={{ __html: importedArticle.content }}
                  />
                </div>
              </article>
            </>
          )}

          {/* Loading State */}
          {loading && (
            <div className="card rounded-lg shadow-sm border p-12 text-center">
              <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Chargement de l&apos;article...</p>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
