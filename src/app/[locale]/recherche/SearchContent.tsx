'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Search, Calendar, Clock, ArrowRight, User, Film, Folder } from 'lucide-react';

type SearchResultType = 'article' | 'author' | 'media' | 'category';

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
    const c = { all: results.length, article: 0, author: 0, media: 0, category: 0 } as Record<string, number>;
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
      case 'category':
        return 'Catégorie';
      default:
        return 'Article';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Rechercher des articles, auteurs, médias..."
            className="w-full pl-12 pr-4 py-3 border border-border rounded-lg text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Recherche en cours...</p>
        </div>
      ) : query && results.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">
            Aucun résultat pour « {query} »
          </h2>
          <p className="text-muted-foreground mb-6">
            Essayez avec d'autres mots-clés ou explorez nos catégories
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['politique', 'economie', 'sport', 'culture', 'religion'].map((category) => (
              <a
                key={category}
                href={`/${locale}/${category}`}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
              >
                {category}
              </a>
            ))}
          </div>
        </div>
      ) : !query ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">
            Que recherchez-vous ?
          </h2>
          <p className="text-muted-foreground mb-6">
            Entrez un mot-clé pour trouver des articles, des auteurs, des médias et plus encore.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveType('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${activeType === 'all' ? 'bg-primary text-white' : 'bg-muted'}`}
              >
                Tous ({counts.all})
              </button>
              <button
                onClick={() => setActiveType('article')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${activeType === 'article' ? 'bg-primary text-white' : 'bg-muted'}`}
              >
                Articles ({counts.article})
              </button>
              <button
                onClick={() => setActiveType('author')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${activeType === 'author' ? 'bg-primary text-white' : 'bg-muted'}`}
              >
                Auteurs ({counts.author})
              </button>
              <button
                onClick={() => setActiveType('media')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${activeType === 'media' ? 'bg-primary text-white' : 'bg-muted'}`}
              >
                Médias ({counts.media})
              </button>
              <button
                onClick={() => setActiveType('category')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${activeType === 'category' ? 'bg-primary text-white' : 'bg-muted'}`}
              >
                Catégories ({counts.category})
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {filteredResults.map((result) => (
              <article
                key={`${result.type}-${result.id}`}
                className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {iconForType(result.type)}
                  <span>{labelForType(result.type)}</span>
                  {result.category ? <span className="px-2 py-1 bg-muted rounded-full">{result.category}</span> : null}
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {result.title}
                </h3>
                {result.excerpt && (
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {result.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {result.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(result.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {result.readTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {result.readTime}
                      </span>
                    )}
                  </div>
                  <a
                    href={result.path}
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                  >
                    Voir
                    <ArrowRight className="ml-2 w-4 h-4" />
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
