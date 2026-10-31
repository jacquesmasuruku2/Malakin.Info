'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import WordEditor from '@/components/WordEditor';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, Upload, X, Loader2 } from 'lucide-react';
import TagInput from '@/components/TagInput';
import { toDatetimeLocalValue } from '@/lib/datetime-local';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  authorId: string | null;
  defaultLocale: string;
  publishedAt: string;
  featured: boolean;
  isPremium: boolean;
  premiumPrice: number | null;
  readTime: string | null;
  mainImageUrl: string | null;
  mainImageAlt: string | null;
  externalLink: string | null;
  additionalImages: string[] | null;
  additionalImageDescriptions: string[] | null;
  tags?: Array<string | { name?: string | null; slug?: string | null }>;
}

interface ArticleTranslationDraft {
  title: string;
  excerpt: string;
  content: string | Record<string, unknown>;
  mainImageAlt: string;
  additionalImageDescriptions: string[];
  seoTitle: string;
  seoDescription: string;
  categoryTitle: string;
  categoryDescription: string;
  status: 'draft' | 'published';
}

function scheduleTranslationRefresh(
  refresh: () => Promise<void>,
  onError: (error: unknown) => void,
) {
  return setInterval(() => {
    refresh().catch(onError);
  }, 2500);
}

function scheduleEditorDataLoad(loaders: Array<() => Promise<void>>) {
  return setTimeout(() => {
    loaders.forEach((load) => {
      void load();
    });
  }, 0);
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [categories, setCategories] = useState<{ id: string; title: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationTargetLocale, setTranslationTargetLocale] = useState('en');
  const [translation, setTranslation] = useState<ArticleTranslationDraft>({
    title: '',
    excerpt: '',
    content: '',
    mainImageAlt: '',
    additionalImageDescriptions: [],
    seoTitle: '',
    seoDescription: '',
    categoryTitle: '',
    categoryDescription: '',
    status: 'draft',
  });
  const [translationJob, setTranslationJob] = useState<{
    status: string;
    attempts: number;
    lastError: string | null;
  } | null>(null);
  const [translationOutdated, setTranslationOutdated] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const localeOptions = ['fr', 'en', 'es', 'sw', 'ln', 'rw'];
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    excerpt: string;
    content: string | Record<string, unknown>;
    categoryId: string;
    authorId: string;
    defaultLocale: string;
    publishedAt: string;
    featured: boolean;
    isPremium: boolean;
    premiumPrice: string;
    readTime: string;
    mainImageUrl: string;
    mainImageAlt: string;
    externalLink: string;
    additionalImages: string[];
    additionalImageDescriptions: string[];
    tags: string[];
  }>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categoryId: '',
    authorId: '',
    defaultLocale: 'fr',
    publishedAt: '',
    featured: false,
    isPremium: false,
    premiumPrice: '',
    readTime: '',
    mainImageUrl: '',
    mainImageAlt: '',
    externalLink: '',
    additionalImages: [],
    additionalImageDescriptions: [],
    tags: [],
  });

  useEffect(() => {
    if (loading || loadError) return;

    const timer = setTimeout(() => {
      localStorage.setItem(`article-draft-${articleId}`, JSON.stringify(formData));
      setAutoSaving(true);
      setTimeout(() => setAutoSaving(false), 1000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, articleId, loading, loadError]);

  const normalizeArticleContent = (content: unknown) => {
    if (typeof content === 'string') {
      return content || '<p></p>';
    }

    if (content && typeof content === 'object') {
      return content as Record<string, unknown>;
    }

    return '<p></p>';
  };

  const loadTranslation = useCallback(async (locale: string) => {
    const response = await fetch(
      `/api/articles/${articleId}/translations?locale=${encodeURIComponent(locale)}`,
      { cache: 'no-store' },
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Impossible de charger la traduction.');

    const saved = data.translation;
    const descriptions = saved?.additionalImageDescriptions;
    setTranslationOutdated(saved?.status === 'outdated');
    setTranslation({
      title: saved?.title || '',
      excerpt: saved?.excerpt || '',
      content: saved?.content === undefined ? '' : normalizeArticleContent(saved.content),
      mainImageAlt: saved?.mainImageAlt || '',
      additionalImageDescriptions: Array.isArray(descriptions)
        ? descriptions.map((description: unknown) => String(description ?? ''))
        : [],
      seoTitle: saved?.seoTitle || '',
      seoDescription: saved?.seoDescription || '',
      categoryTitle: data.category?.title || '',
      categoryDescription: data.category?.description || '',
      status: saved?.status === 'published' ? 'published' : 'draft',
    });
    setTranslationJob(data.job || null);
    setTranslationError('');
  }, [articleId]);

  const fetchArticle = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await fetch(`/api/articles/${articleId}`);
      const data = await response.json().catch(() => null) as (Article & { error?: string }) | null;
      if (!response.ok) {
        throw new Error(data?.error || `Impossible de charger l’article (${response.status}).`);
      }
      if (!data || typeof data !== 'object' || data.id !== articleId || data.content == null) {
        throw new Error('La réponse de l’API ne contient pas le contenu attendu de l’article.');
      }

      const normalizedContent = normalizeArticleContent(data.content);
      const tags = Array.isArray(data.tags)
        ? data.tags
            .map((tag) => (typeof tag === 'string' ? tag : tag?.name || ''))
            .filter((tag): tag is string => Boolean(tag.trim()))
        : [];

      setFormData({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: normalizedContent,
        categoryId: data.categoryId,
        authorId: data.authorId || '',
        defaultLocale: data.defaultLocale || 'fr',
        publishedAt: toDatetimeLocalValue(data.publishedAt),
        featured: data.featured,
        isPremium: data.isPremium || false,
        premiumPrice: data.premiumPrice ? String(data.premiumPrice) : '',
        readTime: data.readTime || '',
        mainImageUrl: data.mainImageUrl || '',
        mainImageAlt: data.mainImageAlt || '',
        externalLink: data.externalLink || '',
        additionalImages: data.additionalImages || [],
        additionalImageDescriptions: data.additionalImageDescriptions || [],
        tags,
      });
      const targetLocale = data.defaultLocale === 'fr' ? 'en' : 'fr';
      setTranslationTargetLocale(targetLocale);
      try {
        await loadTranslation(targetLocale);
      } catch (error) {
        console.error('Failed to fetch translation:', error);
        setTranslationError(error instanceof Error ? error.message : 'Erreur de chargement.');
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
      setLoadError(error instanceof Error ? error.message : 'Erreur de chargement de l’article.');
    } finally {
      setLoading(false);
    }
  }, [articleId, loadTranslation]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  const fetchAuthors = useCallback(async () => {
    try {
      const response = await fetch('/api/authors');
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.error('Failed to fetch authors:', error);
    }
  }, []);

  useEffect(() => {
    const timer = scheduleEditorDataLoad([fetchArticle, fetchCategories, fetchAuthors]);
    return () => clearTimeout(timer);
  }, [fetchArticle, fetchCategories, fetchAuthors]);

  const refreshTranslation = useCallback(
    () => loadTranslation(translationTargetLocale),
    [loadTranslation, translationTargetLocale],
  );
  const translationJobStatus = translationJob?.status;
  useEffect(() => {
    if (!translationJobStatus || !['queued', 'processing'].includes(translationJobStatus)) return;
    const timer = scheduleTranslationRefresh(refreshTranslation, (error) => {
      console.error('Failed to refresh translation job:', error);
    });
    return () => clearInterval(timer);
  }, [refreshTranslation, translationJobStatus]);

  const handleImageUpload = async (file: File, isMainImage: boolean = true, index?: number) => {
    setUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'Images_blogs');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          [data?.error, data?.details].filter(Boolean).join(' — ') ||
            `Upload failed (${response.status})`,
        );
      }

      if (data.success && data.url) {
        if (String(data.url).startsWith('data:')) {
          throw new Error(
            'L’image a été enregistrée en base64 (incompatible email). Vérifiez les credentials Cloudflare R2.',
          );
        }
        if (isMainImage) {
          setFormData({ ...formData, mainImageUrl: data.url });
        } else if (typeof index === 'number') {
          const newImages = [...formData.additionalImages];
          newImages[index] = data.url;
          setFormData({ ...formData, additionalImages: newImages });
        }
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Erreur lors de l\'upload de l\'image',
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        content: typeof formData.content === 'string'
          ? formData.content
          : JSON.stringify(formData.content ?? ''),
      };

      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        localStorage.removeItem(`article-draft-${articleId}`);
        router.push('/articles');
      } else {
        const error = await response.json().catch(() => ({}));
        alert(
          [error?.error, error?.details].filter(Boolean).join(' — ') ||
            'Erreur lors de la modification de l\'article',
        );
      }
    } catch (error) {
      console.error('Failed to update article:', error);
      alert(
        error instanceof Error
          ? `Erreur réseau : ${error.message}`
          : 'Erreur lors de la modification de l\'article',
      );
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

  const handleGenerateTranslation = async () => {
    if (!translationTargetLocale || translationTargetLocale === formData.defaultLocale) {
      alert('Sélectionnez une langue cible différente de la langue de base.');
      return;
    }

    setTranslationLoading(true);

    try {
      const response = await fetch(`/api/articles/${articleId}/translations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: translationTargetLocale }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'La traduction a échoué.');
      }

      setTranslationJob({ status: data.status || 'queued', attempts: 0, lastError: null });
      alert('Traduction ajoutée à la file. Elle sera enregistrée en brouillon pour relecture.');
      await refreshTranslation();
    } catch (error) {
      console.error('Failed to generate translation:', error);
      alert(error instanceof Error ? error.message : 'La traduction a échoué.');
    } finally {
      setTranslationLoading(false);
    }
  };

  const handleSaveTranslation = async () => {
    if (!translation.title.trim() || !translation.excerpt.trim() || !translation.categoryTitle.trim()) {
      setTranslationError('Le titre, le chapeau et la catégorie traduits sont obligatoires.');
      return;
    }

    setTranslationLoading(true);
    setTranslationError('');
    try {
      const response = await fetch(
        `/api/articles/${articleId}/translations/${translationTargetLocale}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...translation,
            content: translation.content,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Impossible d’enregistrer la traduction.');
      await refreshTranslation();
    } catch (error) {
      console.error('Failed to save translation:', error);
      setTranslationError(error instanceof Error ? error.message : 'Erreur de sauvegarde.');
    } finally {
      setTranslationLoading(false);
    }
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

  if (loadError) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="mx-auto max-w-3xl space-y-4 p-8">
            <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{loadError}</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => void fetchArticle()} className="rounded-lg bg-blue-600 px-4 py-2 text-white">
                Réessayer
              </button>
              <button type="button" onClick={() => router.push('/articles')} className="rounded-lg border px-4 py-2">
                Retour aux articles
              </button>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="w-full max-w-none">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-primary tracking-tight">Modifier l&apos;article</h1>
                <p className="text-secondary mt-1">Modifier et publier l&apos;article existant</p>
              </div>
              <div className="flex items-center gap-3">
                {autoSaving && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Auto-sauvegarde</span>
                  </div>
                )}
                <button
                  onClick={() => router.push('/articles')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid items-start gap-6 xl:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
            <div className="card rounded-xl shadow-sm border">
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Titre *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                    placeholder="Titre de l'article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="url-de-l-article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Extrait *</label>
                  <textarea
                    required
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Brève description de l'article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contenu *</label>
                  <WordEditor
                    content={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    locale={formData.defaultLocale}
                    enableSocialEmbed
                    onAddTag={(name) => {
                      setFormData((prev) => {
                        const exists = prev.tags.some(
                          (tag) => tag.toLowerCase() === name.toLowerCase()
                        );
                        if (exists) return prev;
                        return { ...prev, tags: [...prev.tags, name] };
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="card rounded-xl shadow-sm border overflow-hidden lg:sticky lg:top-4">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-primary">Paramètres de l&apos;article</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Langue de base</label>
                    <select
                      value={formData.defaultLocale}
                      onChange={(e) => {
                        const defaultLocale = e.target.value;
                        setFormData({ ...formData, defaultLocale });
                        setTranslationTargetLocale(defaultLocale === 'fr' ? 'en' : 'fr');
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {localeOptions.map((locale) => (
                        <option key={locale} value={locale}>
                          {locale.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Auteur</label>
                    <select
                      value={formData.authorId}
                      onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner un auteur</option>
                      {authors.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Traduire l’article</label>
                    <div className="flex gap-2">
                      <select
                        value={translationTargetLocale}
                        onChange={(e) => {
                          const locale = e.target.value;
                          setTranslationTargetLocale(locale);
                          loadTranslation(locale).catch((error) => {
                            console.error('Failed to fetch translation:', error);
                            setTranslationError(error instanceof Error ? error.message : 'Erreur de chargement.');
                          });
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        {localeOptions
                          .filter((locale) => locale !== formData.defaultLocale)
                          .map((locale) => (
                            <option key={locale} value={locale}>
                              {locale.toUpperCase()}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleGenerateTranslation}
                        disabled={translationLoading}
                        className="px-4 py-3 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {translationLoading ? '...' : 'Générer'}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      La génération crée un brouillon; la version publique ne change qu’après validation.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date et heure de publication</label>
                    <input
                      type="datetime-local"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Temps de lecture (minutes)</label>
                    <input
                      type="number"
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image principale</label>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={formData.mainImageUrl}
                        onChange={(e) => setFormData({ ...formData, mainImageUrl: e.target.value })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://media.malakinfo.com/Images_blogs/..."
                      />
                      <label className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                        {uploadingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span className="text-sm">{uploadingImage ? 'Upload...' : 'Uploader'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, true);
                          }}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                    {formData.mainImageUrl && (
                      <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={formData.mainImageUrl}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, mainImageUrl: '' })}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {formData.mainImageUrl && (
                      <input
                        type="text"
                        value={formData.mainImageAlt}
                        onChange={(e) => setFormData({ ...formData, mainImageAlt: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg italic text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Description de l'image"
                      />
                    )}
                    <p className="text-sm text-gray-500">
                      Collez l&apos;URL de votre image ou uploadez-la directement vers Cloudflare R2.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Images supplémentaires (jusqu&apos;à 4)
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Ajoutez jusqu&apos;à 4 images supplémentaires pour illustrer votre article (captures d&apos;écran, etc.).
                  </p>
                  <div className="space-y-3">
                    {formData.additionalImages.map((url, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => {
                              const newImages = [...formData.additionalImages];
                              newImages[index] = e.target.value;
                              setFormData({ ...formData, additionalImages: newImages });
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder={`URL de l'image ${index + 1}`}
                          />
                          <label className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                            {uploadingImage ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span className="text-sm">Upload</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const newImages = [...formData.additionalImages];
                                  newImages[index] = ''; // Clear current URL
                                  setFormData({ ...formData, additionalImages: newImages });
                                  handleImageUpload(file, false, index);
                                }
                              }}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = formData.additionalImages.filter((_, i) => i !== index);
                              const descriptions = formData.additionalImageDescriptions.filter((_, i) => i !== index);
                              setFormData({ ...formData, additionalImages: newImages, additionalImageDescriptions: descriptions });
                            }}
                            className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                        {url && (
                          <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={url}
                              alt={`Aperçu ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <input
                          type="text"
                          value={formData.additionalImageDescriptions[index] || ''}
                          onChange={(e) => {
                            const descriptions = [...formData.additionalImageDescriptions];
                            descriptions[index] = e.target.value;
                            setFormData({ ...formData, additionalImageDescriptions: descriptions });
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg italic text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Description de l'image"
                        />
                      </div>
                    ))}
                    {formData.additionalImages.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, additionalImages: [...formData.additionalImages, ''] })}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
                      >
                        + Ajouter une image
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lien externe de destination</label>
                  <input
                    type="url"
                    value={formData.externalLink}
                    onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://www.example.com"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Si ce champ est rempli, les visiteurs seront redirigés vers cette URL au clic sur l&apos;article.
                  </p>
                </div>

                <TagInput
                  value={formData.tags}
                  onChange={(tags) => setFormData({ ...formData, tags })}
                />

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                    Article à la une
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isPremium"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isPremium" className="text-sm font-medium text-gray-700">
                    Article premium (réservé aux abonnés)
                  </label>
                </div>

                {formData.isPremium && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prix de l&apos;article ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.premiumPrice}
                      onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="1.90"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Laissez vide pour utiliser le prix par défaut (1.90$)
                    </p>
                  </div>
                )}
              </div>
            </div>
            </div>

            <section className="card rounded-xl border p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-primary">Éditeur de traduction</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Corrigez la traduction complète, ses métadonnées et les textes éditoriaux associés.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    Tâche : {translationJob?.status || 'aucune'}
                  </span>
                  {translationJob && (
                    <span className="text-xs text-gray-500">Tentatives : {translationJob.attempts}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => refreshTranslation().catch((error) => {
                      setTranslationError(error instanceof Error ? error.message : 'Erreur de chargement.');
                    })}
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Actualiser
                  </button>
                </div>
              </div>

              {translationJob?.lastError && (
                <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  Échec : {translationJob.lastError}
                </p>
              )}
              {translationOutdated && (
                <p role="status" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                  Le contenu source a changé. Cette traduction est obsolète et n’est plus publiée; relisez-la ou régénérez-la avant de la publier.
                </p>
              )}
              {translationError && (
                <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {translationError}
                </p>
              )}
              {!translation.title && (
                <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  Aucune traduction enregistrée pour cette langue. Générez-en une ou saisissez-la ci-dessous.
                </p>
              )}

              <div className="grid gap-5 lg:grid-cols-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Titre
                  <input
                    value={translation.title}
                    onChange={(event) => setTranslation({ ...translation, title: event.target.value })}
                    className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"
                  />
                </label>
                <label className="block text-sm font-semibold text-gray-700">
                  Catégorie
                  <input
                    value={translation.categoryTitle}
                    onChange={(event) => setTranslation({ ...translation, categoryTitle: event.target.value })}
                    className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"
                  />
                </label>
                <label className="block text-sm font-semibold text-gray-700 lg:col-span-2">
                  Chapeau
                  <textarea
                    value={translation.excerpt}
                    onChange={(event) => setTranslation({ ...translation, excerpt: event.target.value })}
                    rows={3}
                    className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"
                  />
                </label>
                <label className="block text-sm font-semibold text-gray-700 lg:col-span-2">
                  Article complet
                  <div className="mt-2">
                    <WordEditor
                      content={translation.content}
                      onChange={(content) => setTranslation({ ...translation, content })}
                      locale={translationTargetLocale}
                      enableSocialEmbed
                    />
                  </div>
                </label>
                <label className="block text-sm font-semibold text-gray-700">
                  Texte alternatif de l’image principale
                  <input
                    value={translation.mainImageAlt}
                    onChange={(event) => setTranslation({ ...translation, mainImageAlt: event.target.value })}
                    className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"
                  />
                </label>
                <label className="block text-sm font-semibold text-gray-700">
                  Description de la catégorie
                  <textarea
                    value={translation.categoryDescription}
                    onChange={(event) => setTranslation({ ...translation, categoryDescription: event.target.value })}
                    rows={2}
                    className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"
                  />
                </label>
                <label className="block text-sm font-semibold text-gray-700">
                  Titre SEO
                  <input
                    value={translation.seoTitle}
                    onChange={(event) => setTranslation({ ...translation, seoTitle: event.target.value })}
                    className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"
                  />
                </label>
                <label className="block text-sm font-semibold text-gray-700">
                  Description SEO
                  <textarea
                    value={translation.seoDescription}
                    onChange={(event) => setTranslation({ ...translation, seoDescription: event.target.value })}
                    rows={2}
                    className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"
                  />
                </label>
                {formData.additionalImages.length > 0 && (
                  <div className="lg:col-span-2">
                    <p className="mb-2 text-sm font-semibold text-gray-700">Légendes des images supplémentaires</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {formData.additionalImages.map((_, index) => (
                        <input
                          key={index}
                          value={translation.additionalImageDescriptions[index] || ''}
                          onChange={(event) => {
                            const descriptions = [...translation.additionalImageDescriptions];
                            descriptions[index] = event.target.value;
                            setTranslation({ ...translation, additionalImageDescriptions: descriptions });
                          }}
                          aria-label={`Légende traduite de l’image ${index + 1}`}
                          placeholder={`Légende de l’image ${index + 1}`}
                          className="w-full rounded-lg border px-3 py-2"
                        />
                      ))}
                    </div>
                  </div>
                )}
                <label className="block text-sm font-semibold text-gray-700">
                  État éditorial
                  <select
                    value={translation.status}
                    onChange={(event) => setTranslation({
                      ...translation,
                      status: event.target.value === 'published' ? 'published' : 'draft',
                    })}
                    className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"
                  >
                    <option value="draft">Brouillon (non indexable)</option>
                    <option value="published">Publier cette traduction</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveTranslation}
                  disabled={translationLoading}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {translationLoading ? 'Enregistrement...' : 'Enregistrer la traduction'}
                </button>
              </div>
            </section>

            <div className="flex items-center justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/articles')}
                className="px-6 py-3 text-sm font-medium text-gray-700 card border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Enregistrement...' : 'Mettre à jour'}</span>
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
