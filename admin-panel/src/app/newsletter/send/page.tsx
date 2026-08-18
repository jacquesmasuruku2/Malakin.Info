'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import NewsletterArticleSelector, { type NewsletterArticleOption } from '@/components/NewsletterArticleSelector';
import { generateCustomNewsletterHtml, generateMalakinfoNewsletterHtml } from '@/lib/newsletter';
import { Loader2, Send } from 'lucide-react';

export default function NewsletterSendPage() {
  const [articles, setArticles] = useState<NewsletterArticleOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subject, setSubject] = useState('Malakinfo — L’essentiel de la semaine');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [mode, setMode] = useState<'articles' | 'custom'>('articles');
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('Bonjour {{name}},\n\n');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [imageLinkUrl, setImageLinkUrl] = useState('');
  const [buttonLabel, setButtonLabel] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');

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
    if (mode === 'articles' && (selectedArticles.length < 1 || selectedArticles.length > 6)) {
      return '';
    }

    try {
      return mode === 'custom'
        ? generateCustomNewsletterHtml({
            title: customTitle || 'Newsletter Malakinfo',
            content: customContent,
            heroImageUrl,
            imageUrls: imageUrls.split(/\r?\n/),
            imageLinkUrl,
            buttonLabel,
            buttonUrl,
          })
        : generateMalakinfoNewsletterHtml(selectedArticles);
    } catch (error) {
      console.error(error);
      return '';
    }
  }, [buttonLabel, buttonUrl, customContent, customTitle, heroImageUrl, imageLinkUrl, imageUrls, mode, selectedArticles]);

  const previewContainerKey = `${previewMode}-${selectedIds.join('-') || 'empty'}`;

  const handleSubmit = async () => {
    if (mode === 'articles' && (selectedArticles.length < 1 || selectedArticles.length > 6)) {
      setStatus({ type: 'error', message: 'Veuillez sélectionner entre 1 et 6 articles.' });
      return;
    }
    if (mode === 'custom' && (!customTitle.trim() || !customContent.trim())) {
      setStatus({ type: 'error', message: 'Veuillez renseigner un titre et un texte pour la newsletter.' });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      const payload = {
        subject,
        html: htmlPreview,
        text: customContent || 'Newsletter Malakinfo',
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
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary md:text-3xl">Envoyer une newsletter</h1>
          <p className="text-sm text-secondary mt-1 md:text-base">
            Choisissez une newsletter éditoriale ou écrivez un message personnalisé avec vos propres images.
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

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:space-y-6 md:p-6">
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

          <div className="grid gap-2 rounded-lg bg-slate-100 p-1 sm:grid-cols-2">
            <button type="button" onClick={() => setMode('articles')} className={`rounded-md px-4 py-2 text-sm font-semibold ${mode === 'articles' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>À partir d’articles</button>
            <button type="button" onClick={() => setMode('custom')} className={`rounded-md px-4 py-2 text-sm font-semibold ${mode === 'custom' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Newsletter personnalisée</button>
          </div>

          {mode === 'articles' && isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement des articles...
            </div>
          ) : mode === 'articles' ? (
            <NewsletterArticleSelector articles={articles} selectedIds={selectedIds} onChange={setSelectedIds} />
          ) : (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <label htmlFor="custom-title" className="mb-2 block text-sm font-medium text-slate-700">Titre de la newsletter</label>
                <input id="custom-title" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Ex. Une annonce importante pour notre communauté" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-red-500" />
              </div>
              <div>
                <label htmlFor="custom-content" className="mb-2 block text-sm font-medium text-slate-700">Texte personnalisé</label>
                <textarea id="custom-content" rows={10} value={customContent} onChange={(e) => setCustomContent(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 shadow-sm outline-none focus:border-red-500" />
                <p className="mt-1 text-xs text-slate-500">Utilisez <strong>{'{{name}}'}</strong> pour afficher automatiquement le prénom de chaque abonné. Les paragraphes séparés par une ligne vide sont conservés.</p>
              </div>
              <div>
                <label htmlFor="hero-image" className="mb-2 block text-sm font-medium text-slate-700">URL de l’image principale (HTTPS)</label>
                <input id="hero-image" type="url" value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-red-500" />
              </div>
              <div>
                <label htmlFor="image-urls" className="mb-2 block text-sm font-medium text-slate-700">URLs d’images complémentaires</label>
                <textarea id="image-urls" rows={3} value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} placeholder="Une URL HTTPS par ligne" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-500" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><label htmlFor="image-link" className="mb-2 block text-sm font-medium text-slate-700">Lien au clic sur l’image</label><input id="image-link" type="url" value={imageLinkUrl} onChange={(e) => setImageLinkUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-red-500" /></div>
                <div><label htmlFor="button-label" className="mb-2 block text-sm font-medium text-slate-700">Texte du bouton (facultatif)</label><input id="button-label" value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} placeholder="Découvrir" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-red-500" /></div>
              </div>
              {buttonLabel && <div><label htmlFor="button-url" className="mb-2 block text-sm font-medium text-slate-700">URL du bouton</label><input id="button-url" type="url" value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-red-500" /></div>}
            </div>
          )}

          {htmlPreview ? (
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
                className={`mx-auto overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-0 md:p-3 ${
                  previewMode === 'desktop' ? 'max-w-[760px]' : 'max-w-[390px]'
                }`}
              >
                <div className="scale-[1] md:scale-100" dangerouslySetInnerHTML={{ __html: htmlPreview }} />
              </div>
            </div>
          ) : null}

          <button
            type="button"
            disabled={isSending || (mode === 'articles' && (selectedArticles.length < 1 || selectedArticles.length > 6)) || (mode === 'custom' && (!customTitle.trim() || !customContent.trim()))}
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
