'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Search, Calendar, Clock, ArrowRight, User, Film, Folder, Play } from 'lucide-react';

type SearchResultType = 'article' | 'author' | 'media' | 'live' | 'category';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  excerpt: string;
  path: string;
  category?: string;
  date?: string;
  readTime?: string;
}

const initialResults: SearchResult[] = [];

export default function SearchContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'fr';
  const query = searchParams.get('q')?.trim() || '';
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState<SearchResult[]>(initialResults);
  const [activeType, setActiveType] = useState<'all' | SearchResultType>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    if (!query) {
      setResults(initialResults);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchResults() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/recherche?q=${encodeURIComponent(query)}`, {
          signal,
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la recherche');
        }

        const data: SearchResult[] = await response.json();
        setResults(
          data.map((item) => ({
            ...item,
            path: item.path.startsWith('/') ? `/${locale}${item.path}` : `/${locale}${item.path}`,
          }))
        );
      } catch (err) {
        if ((err as any).name !== 'AbortError') {
          console.error('Search fetch error:', err);
          setError('Impossible de charger les résultats. Réessayez plus tard.');
          setResults(initialResults);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();

    return () => {
      controller.abort();
    };
  }, [query, locale]);

  const counts = useMemo(() => {
    const c = { all: results.length, article: 0, author: 0, media: 0, live: 0, category: 0 } as Record<string, number>;
    for (const r of results) {
      c[r.type] = (c[r.type] || 0) + 1;
    }
    return c;
  }, [results]);

  const filteredResults = useMemo(() => {
    if (activeType === 'all') return results;
    return results.filter((r) => r.type === activeType);
  }, [results, activeType]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed && trimmed !== query) {
      router.push(`/${locale}/recherche?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const iconForType = (type: SearchResultType) => {
    switch (type) {
      case 'author':
        return <User className="w-4 h-4" />;
      case 'media':
        return <Film className="w-4 h-4" />;
      case 'live':
        return <Play className="w-4 h-4" />;
      case 'category':
        return <Folder className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const labelForType = (type: SearchResultType) => {
    switch (type) {
      case 'author':
        return 'Auteur';
      case 'media':
        return 'Média';
      case 'live':
        return 'Direct';
      case 'category':
        return 'Catégorie';
      default:
        return 'Article';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0b3b8b]" />
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Rechercher des articles, auteurs, médias..."
              className="w-full rounded-full border-2 border-[#0b3b8b]/60 bg-white py-4 pl-12 pr-5 text-base text-[#0f172a] shadow-[0_10px_24px_rgba(11,59,139,0.08)] outline-none transition focus:border-[#0b3b8b] focus:ring-4 focus:ring-[#0b3b8b]/10"
            />
          </div>
        </form>
      </div>

      {error ? (
        <div className="py-12 text-center">
          <p className="mb-4 text-base font-medium text-red-600">{error}</p>
        </div>
      ) : isLoading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-[#475569]">Recherche en cours...</p>
        </div>
      ) : query && results.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-[#edf4ff] text-[#0b3b8b] shadow-inner">
            <Search className="h-8 w-8" />
          </div>
          <h2 className="mb-2 font-heading text-2xl font-bold text-[#0f172a] sm:text-3xl">
            Aucun résultat pour « {query} »
          </h2>
          <p className="mb-6 text-[#475569]">
            Essayez un autre mot-clé ou explorez directement nos catégories.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['politique', 'economie', 'sport', 'culture', 'religion'].map((category) => (
              <a
                key={category}
                href={`/${locale}/${category}`}
                className="rounded-full border border-[#dfe5ef] bg-white px-4 py-2 text-sm font-semibold text-[#0f172a] transition hover:border-[#0b3b8b] hover:text-[#0b3b8b]"
              >
                {category}
              </a>
            ))}
          </div>
        </div>
      ) : !query ? (
        <div className="py-14 text-center">
          <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-[#edf4ff] text-[#0b3b8b] shadow-inner">
            <Search className="h-8 w-8" />
          </div>
          <h2 className="mb-2 font-heading text-2xl font-bold text-[#0f172a] sm:text-3xl">
            Que recherchez-vous ?
          </h2>
          <p className="mx-auto max-w-xl text-[#475569]">
            Entrez un mot-clé pour trouver des articles, des auteurs, des médias et des sujets d’actualité.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#475569]">
              {results.length} résultat{results.length > 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveType('all')}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${activeType === 'all' ? 'bg-[#0b3b8b] text-white' : 'bg-white text-[#334155] ring-1 ring-[#dfe5ef]'}`}
              >
                Tous ({counts.all})
              </button>
              <button
                onClick={() => setActiveType('article')}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${activeType === 'article' ? 'bg-[#0b3b8b] text-white' : 'bg-white text-[#334155] ring-1 ring-[#dfe5ef]'}`}
              >
                Articles ({counts.article})
              </button>
              <button
                onClick={() => setActiveType('author')}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${activeType === 'author' ? 'bg-[#0b3b8b] text-white' : 'bg-white text-[#334155] ring-1 ring-[#dfe5ef]'}`}
              >
                Auteurs ({counts.author})
              </button>
              <button
                onClick={() => setActiveType('media')}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${activeType === 'media' ? 'bg-[#0b3b8b] text-white' : 'bg-white text-[#334155] ring-1 ring-[#dfe5ef]'}`}
              >
                Médias ({counts.media})
              </button>
              <button
                onClick={() => setActiveType('live')}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${activeType === 'live' ? 'bg-[#0b3b8b] text-white' : 'bg-white text-[#334155] ring-1 ring-[#dfe5ef]'}`}
              >
                Directs ({counts.live})
              </button>
              <button
                onClick={() => setActiveType('category')}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${activeType === 'category' ? 'bg-[#0b3b8b] text-white' : 'bg-white text-[#334155] ring-1 ring-[#dfe5ef]'}`}
              >
                Catégories ({counts.category})
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {filteredResults.map((result) => (
              <article
                key={`${result.type}-${result.id}`}
                className="rounded-2xl border border-[#e7e7e1] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.06)] sm:p-6"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#475569]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#edf4ff] px-2.5 py-1 text-[#0b3b8b]">
                    {iconForType(result.type)}
                    {labelForType(result.type)}
                  </span>
                  {result.category ? (
                    <span className="rounded-full bg-[#f8f3df] px-2.5 py-1 text-[#7a5b00]">{result.category}</span>
                  ) : null}
                </div>
                <h3 className="mb-2 font-heading text-xl font-bold text-[#0f172a] sm:text-2xl">
                  {result.title}
                </h3>
                {result.excerpt && (
                  <p className="mb-4 line-clamp-2 text-sm leading-6 text-[#475569] sm:text-base">
                    {result.excerpt}
                  </p>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#475569]">
                    {result.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(result.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {result.readTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {result.readTime}
                      </span>
                    )}
                  </div>
                  <a
                    href={result.path}
                    className="inline-flex items-center gap-2 self-start rounded-full bg-[#0b3b8b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#082a63]"
                  >
                    Voir
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
