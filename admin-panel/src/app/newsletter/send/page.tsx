'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import NewsletterArticleSelector, { type NewsletterArticleOption } from '@/components/NewsletterArticleSelector';
import { generateMalakinfoNewsletterHtml } from '@/lib/newsletter';
import { Loader2, Send } from 'lucide-react';

export default function NewsletterSendPage() {
  const [articles, setArticles] = useState<NewsletterArticleOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subject, setSubject] = useState('Malakinfo — L’essentiel de la semaine');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/articles');
        if (!response.ok) {
          throw new Error('Impossible de charger les articles');
        }

        const data = await response.json();
        setArticles(
          data.map((article: any) => ({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            slug: article.slug,
            mainImageUrl: article.mainImageUrl,
            category: article.category,
          })),
        );
      } catch (error) {
        console.error(error);
        setStatus({
          type: 'error',
          message: 'Impossible de charger les articles pour la newsletter.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, []);

  const selectedArticles = useMemo(
    () => selectedIds.map((id) => articles.find((article) => article.id === id)).filter(Boolean) as NewsletterArticleOption[],
    [articles, selectedIds],
  );

  const htmlPreview = useMemo(() => {
    if (selectedArticles.length < 1 || selectedArticles.length > 6) {
      return '';
    }

    try {
      return generateMalakinfoNewsletterHtml(selectedArticles);
    } catch (error) {
      console.error(error);
      return '';
    }
  }, [selectedArticles]);

  const previewContainerKey = `${previewMode}-${selectedIds.join('-') || 'empty'}`;

  const handleSubmit = async () => {
    if (selectedArticles.length < 1 || selectedArticles.length > 6) {
      setStatus({ type: 'error', message: 'Veuillez sélectionner entre 1 et 6 articles.' });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      const payload = {
        subject,
        html: htmlPreview,
        text: 'Newsletter Malakinfo',
        filter: { activeOnly: true },
      };

      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Erreur lors de l’envoi');
      }

      setStatus({
        type: 'success',
        message: `Newsletter envoyée à ${data.count ?? 0} abonnés.`,
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur réseau lors de l’envoi.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Envoyer une newsletter</h1>
          <p className="text-secondary mt-1">
            Créez un bulletin structuré avec un article à la une et jusqu’à 5 compléments, maximum 6 articles.
          </p>
        </div>

        {status && (
          <div
            className={`rounded-lg border p-4 ${
              status.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="subject" className="mb-2 block text-sm font-medium text-slate-700">
              Objet
            </label>
            <input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm outline-none focus:border-red-500"
              required
            />
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement des articles...
            </div>
          ) : (
            <NewsletterArticleSelector articles={articles} selectedIds={selectedIds} onChange={setSelectedIds} />
          )}

          {selectedArticles.length >= 1 && selectedArticles.length <= 6 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Aperçu</h2>

                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
                  {(['desktop', 'mobile'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPreviewMode(mode)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                        previewMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      {mode === 'desktop' ? 'Desktop' : 'Mobile'}
                    </button>
                  ))}
                </div>
              </div>

              <div
                key={previewContainerKey}
                className={`mx-auto overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-3 ${
                  previewMode === 'desktop' ? 'max-w-[760px]' : 'max-w-[420px]'
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
              </div>
            </div>
          ) : null}

          <button
            type="button"
            disabled={isSending || selectedArticles.length < 1 || selectedArticles.length > 6}
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Envoi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Envoyer la newsletter
              </>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
