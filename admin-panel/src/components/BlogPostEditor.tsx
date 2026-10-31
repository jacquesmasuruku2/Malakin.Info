'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import WordEditor from '@/components/WordEditor';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toDatetimeLocalValue } from '@/lib/datetime-local';

type BlogPostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string | Record<string, unknown>;
  type: string;
  authorId: string;
  publishedAt: string;
  mainImageUrl: string;
  mainImageAlt: string;
  readTime: string;
  featured: boolean;
  defaultLocale: string;
};

type BlogTranslationForm = {
  title: string;
  excerpt: string;
  content: string | Record<string, unknown>;
  mainImageAlt: string;
  seoTitle: string;
  seoDescription: string;
  status: 'draft' | 'published';
};

const locales = ['fr', 'en', 'es', 'sw', 'ln', 'rw'];
const inputClass = 'w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

function blankPost(): BlogPostForm {
  return {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    type: 'blog',
    authorId: '',
    publishedAt: toDatetimeLocalValue(new Date()),
    mainImageUrl: '',
    mainImageAlt: '',
    readTime: '',
    featured: false,
    defaultLocale: 'fr',
  };
}

function blankTranslation(): BlogTranslationForm {
  return {
    title: '',
    excerpt: '',
    content: '',
    mainImageAlt: '',
    seoTitle: '',
    seoDescription: '',
    status: 'draft',
  };
}

function slugifyBlogTitle(title: string): string {
  return title.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function scheduleRefresh(refresh: () => Promise<void>) {
  return setInterval(() => {
    refresh().catch((error) => console.error('Failed to refresh blog translation:', error));
  }, 2500);
}

export default function BlogPostEditor({ mode }: { mode: 'create' | 'edit' }) {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const postId = mode === 'edit' ? params.id : undefined;
  const [form, setForm] = useState<BlogPostForm>(blankPost);
  const [translation, setTranslation] = useState<BlogTranslationForm>(blankTranslation);
  const [authors, setAuthors] = useState<Array<{ id: string; name: string }>>([]);
  const [targetLocale, setTargetLocale] = useState('en');
  const [job, setJob] = useState<{ status: string; attempts: number; lastError: string | null } | null>(null);
  const [translationOutdated, setTranslationOutdated] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadTranslation = useCallback(async (locale = targetLocale) => {
    if (!postId) return;
    const response = await fetch(
      `/api/blog-posts/${postId}/translations?locale=${encodeURIComponent(locale)}`,
      { cache: 'no-store' },
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Impossible de charger la traduction.');
    setTranslation({
      ...blankTranslation(),
      ...data.translation,
      content: data.translation?.content ?? '',
      status: data.translation?.status === 'published' ? 'published' : 'draft',
    });
    setTranslationOutdated(data.translation?.status === 'outdated');
    setJob(data.job || null);
    setError('');
  }, [postId, targetLocale]);

  const loadPost = useCallback(async () => {
    if (!postId) return;
    try {
      const [postResponse, authorsResponse] = await Promise.all([
        fetch(`/api/blog-posts/${postId}`),
        fetch('/api/authors'),
      ]);
      const [post, authorsData] = await Promise.all([postResponse.json(), authorsResponse.json()]);
      if (!postResponse.ok) throw new Error(post?.error || 'Impossible de charger le billet.');
      setForm({
        ...blankPost(),
        ...post,
        publishedAt: post.publishedAt ? toDatetimeLocalValue(post.publishedAt) : '',
        authorId: post.authorId || '',
        content: post.content ?? '',
      });
      setAuthors(Array.isArray(authorsData) ? authorsData : []);
      const initialLocale = post.defaultLocale === 'fr' ? 'en' : 'fr';
      setTargetLocale(initialLocale);
      setLoading(false);
      const translationResponse = await fetch(
        `/api/blog-posts/${postId}/translations?locale=${initialLocale}`,
        { cache: 'no-store' },
      );
      const translationData = await translationResponse.json();
      if (!translationResponse.ok) throw new Error(translationData?.error || 'Impossible de charger la traduction.');
      setTranslation({
        ...blankTranslation(),
        ...translationData.translation,
        content: translationData.translation?.content ?? '',
        status: translationData.translation?.status === 'published' ? 'published' : 'draft',
      });
      setTranslationOutdated(translationData.translation?.status === 'outdated');
      setJob(translationData.job || null);
    } catch (loadError) {
      console.error('Failed to load blog post:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Erreur de chargement.');
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch('/api/authors')
        .then(async (response) => {
          if (!response.ok) throw new Error('Impossible de charger les auteurs.');
          const data = await response.json();
          setAuthors(Array.isArray(data) ? data : []);
        })
        .catch((loadError) => {
          console.error('Failed to load authors:', loadError);
          setError(loadError instanceof Error ? loadError.message : 'Erreur de chargement.');
        });
      if (mode === 'edit') void loadPost();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPost, mode]);

  const jobStatus = job?.status;
  useEffect(() => {
    if (!jobStatus || !['queued', 'processing'].includes(jobStatus)) return;
    const timer = scheduleRefresh(loadTranslation);
    return () => clearInterval(timer);
  }, [jobStatus, loadTranslation]);

  const updateForm = <K extends keyof BlogPostForm>(key: K, value: BlogPostForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateTranslation = <K extends keyof BlogTranslationForm>(
    key: K,
    value: BlogTranslationForm[K],
  ) => {
    setTranslation((current) => ({ ...current, [key]: value }));
  };

  const handleSaveSource = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch(postId ? `/api/blog-posts/${postId}` : '/api/blog-posts', {
        method: postId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ...(mode === 'create' ? { translationTargetLocale: targetLocale } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Impossible d’enregistrer le billet.');

      if (!postId) {
        router.push(`/blog-posts/${data.id}/edit`);
        return;
      }
      await loadTranslation();
      setError('Billet enregistré.');
    } catch (saveError) {
      console.error('Failed to save blog post:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Erreur de sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const generateTranslation = async () => {
    if (!postId) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/blog-posts/${postId}/translations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: targetLocale }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Impossible de lancer la traduction.');
      setJob({ status: data.status, attempts: 0, lastError: null });
      await loadTranslation();
    } catch (generationError) {
      console.error('Failed to generate blog translation:', generationError);
      setError(generationError instanceof Error ? generationError.message : 'Erreur de traduction.');
    } finally {
      setSaving(false);
    }
  };

  const saveTranslation = async () => {
    if (!postId) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/blog-posts/${postId}/translations/${targetLocale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(translation),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Impossible d’enregistrer la traduction.');
      setTranslation((current) => ({ ...current, ...data.translation }));
      setTranslationOutdated(false);
      setError('Traduction enregistrée.');
    } catch (saveError) {
      console.error('Failed to save blog translation:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Erreur de sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('folder', 'Images_blogs');
      const response = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const data = await response.json();
      if (!response.ok || !data.url || String(data.url).startsWith('data:')) {
        throw new Error(data?.error || 'Impossible de publier l’image.');
      }
      updateForm('mainImageUrl', data.url);
    } catch (uploadError) {
      console.error('Failed to upload blog image:', uploadError);
      setError(uploadError instanceof Error ? uploadError.message : 'Erreur d’upload.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <AdminLayout><p className="p-8 text-center">Chargement…</p></AdminLayout>;
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">{mode === 'create' ? 'Nouveau billet' : 'Modifier le billet'}</h1>
              <p className="mt-1 text-secondary">Publiez et traduisez vos contenus de blog.</p>
            </div>
            <button type="button" onClick={() => router.push('/blog-posts')} className="rounded-lg border px-4 py-2">
              Retour aux blogs
            </button>
          </div>

          <form onSubmit={handleSaveSource} className="card space-y-5 rounded-xl border p-6">
            <h2 className="text-xl font-semibold">Contenu original</h2>
            <label className="block text-sm font-medium">Titre
              <input required className={inputClass} value={form.title} onChange={(event) => {
                const title = event.target.value;
                updateForm('title', title);
                if (!form.slug || form.slug === slugifyBlogTitle(form.title)) {
                  updateForm('slug', slugifyBlogTitle(title));
                }
              }} />
            </label>
            <label className="block text-sm font-medium">Slug
              <input required className={inputClass} value={form.slug} onChange={(event) => updateForm('slug', event.target.value)} />
            </label>
            <label className="block text-sm font-medium">Chapeau
              <textarea required rows={3} className={inputClass} value={form.excerpt} onChange={(event) => updateForm('excerpt', event.target.value)} />
            </label>
            <label className="block text-sm font-medium">Corps
              <WordEditor content={form.content} onChange={(content) => updateForm('content', content)} locale={form.defaultLocale} enableSocialEmbed />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium">Type
                <input required className={inputClass} value={form.type} onChange={(event) => updateForm('type', event.target.value)} />
              </label>
              <label className="block text-sm font-medium">Langue source
                <select className={inputClass} value={form.defaultLocale} onChange={(event) => {
                  const sourceLocale = event.target.value;
                  const target = sourceLocale === 'fr' ? 'en' : 'fr';
                  updateForm('defaultLocale', sourceLocale);
                  setTargetLocale(target);
                  if (postId) {
                    loadTranslation(target).catch((loadError) => {
                      console.error('Failed to load blog translation:', loadError);
                      setError(loadError instanceof Error ? loadError.message : 'Erreur de chargement.');
                    });
                  }
                }}>
                  {locales.map((locale) => <option key={locale} value={locale}>{locale.toUpperCase()}</option>)}
                </select>
              </label>
              {mode === 'create' && (
                <label className="block text-sm font-medium">Générer la traduction
                  <select className={inputClass} value={targetLocale} onChange={(event) => setTargetLocale(event.target.value)}>
                    {locales.filter((locale) => locale !== form.defaultLocale).map((locale) => (
                      <option key={locale} value={locale}>{locale.toUpperCase()}</option>
                    ))}
                  </select>
                </label>
              )}
              <label className="block text-sm font-medium">Auteur
                <select className={inputClass} value={form.authorId} onChange={(event) => updateForm('authorId', event.target.value)}>
                  <option value="">MalakInfo</option>
                  {authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">Date de publication
                <input required type="datetime-local" className={inputClass} value={form.publishedAt} onChange={(event) => updateForm('publishedAt', event.target.value)} />
              </label>
              <label className="block text-sm font-medium">Temps de lecture (minutes)
                <input type="number" min="1" className={inputClass} value={form.readTime} onChange={(event) => updateForm('readTime', event.target.value)} />
              </label>
              <label className="block text-sm font-medium">Texte alternatif de l’image
                <input className={inputClass} value={form.mainImageAlt} onChange={(event) => updateForm('mainImageAlt', event.target.value)} />
              </label>
            </div>
            <label className="block text-sm font-medium">Image principale
              <div className="mt-2 flex gap-3">
                <input className={inputClass} value={form.mainImageUrl} onChange={(event) => updateForm('mainImageUrl', event.target.value)} />
                <input type="file" accept="image/*" disabled={uploading} onChange={(event) => void uploadImage(event.target.files?.[0])} />
              </div>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(event) => updateForm('featured', event.target.checked)} />
              Mettre à la une
            </label>
            <button disabled={saving} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50">
              {saving ? 'Enregistrement…' : 'Enregistrer le billet'}
            </button>
          </form>

          {mode === 'edit' && (
            <section className="card space-y-5 rounded-xl border p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Traduction éditoriale</h2>
                  <p className="mt-1 text-sm text-secondary">
                    {job ? `État : ${job.status} · tentatives : ${job.attempts}${job.lastError ? ` · ${job.lastError}` : ''}` : 'Aucune tâche de traduction.'}
                  </p>
                </div>
                {translationOutdated && (
                  <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                    Le contenu source a changé. Cette traduction n’est plus publiée; relisez-la ou régénérez-la avant de la publier.
                  </p>
                )}
                <div className="flex gap-2">
                  <select className={inputClass} value={targetLocale} onChange={(event) => {
                    const locale = event.target.value;
                    setTargetLocale(locale);
                    setError('');
                    loadTranslation(locale).catch((loadError) => {
                      console.error('Failed to load selected blog translation:', loadError);
                      setError(loadError instanceof Error ? loadError.message : 'Erreur de chargement.');
                    });
                  }}>
                    {locales.filter((locale) => locale !== form.defaultLocale).map((locale) => (
                      <option key={locale} value={locale}>{locale.toUpperCase()}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => void generateTranslation()} disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-50">
                    Générer / relancer
                  </button>
                </div>
              </div>
              <label className="block text-sm font-medium">Titre traduit
                <input className={inputClass} value={translation.title} onChange={(event) => updateTranslation('title', event.target.value)} />
              </label>
              <label className="block text-sm font-medium">Chapeau traduit
                <textarea rows={3} className={inputClass} value={translation.excerpt} onChange={(event) => updateTranslation('excerpt', event.target.value)} />
              </label>
              <label className="block text-sm font-medium">Corps traduit
                <WordEditor content={translation.content} onChange={(content) => updateTranslation('content', content)} locale={targetLocale} enableSocialEmbed />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium">Texte alternatif traduit
                  <input className={inputClass} value={translation.mainImageAlt} onChange={(event) => updateTranslation('mainImageAlt', event.target.value)} />
                </label>
                <label className="block text-sm font-medium">Titre SEO
                  <input className={inputClass} value={translation.seoTitle} onChange={(event) => updateTranslation('seoTitle', event.target.value)} />
                </label>
                <label className="block text-sm font-medium md:col-span-2">Description SEO
                  <textarea rows={2} className={inputClass} value={translation.seoDescription} onChange={(event) => updateTranslation('seoDescription', event.target.value)} />
                </label>
                <label className="block text-sm font-medium">Publication
                  <select className={inputClass} value={translation.status} onChange={(event) => updateTranslation('status', event.target.value as BlogTranslationForm['status'])}>
                    <option value="draft">Brouillon</option>
                    <option value="published">Publier la traduction</option>
                  </select>
                </label>
              </div>
              <button type="button" onClick={() => void saveTranslation()} disabled={saving} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50">
                Enregistrer la traduction
              </button>
            </section>
          )}
          {error && <p role="status" className="rounded-lg bg-blue-50 p-4 text-blue-900">{error}</p>}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
