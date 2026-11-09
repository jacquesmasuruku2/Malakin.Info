'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  ArrowRight,
  FileText, 
  Users, 
  LayoutDashboard,
  FolderTree,
  Radio,
  Plus,
} from 'lucide-react';

interface Stats {
  articles: number;
  authors: number;
  categories: number;
  totalViews: number;
  featuredArticles: number;
  publishedThisMonth: number;
  lives: number;
  activeLives: number;
  publicationTrend: Array<{ date: string; count: number }>;
  categoryDistribution: Array<{ name: string; count: number }>;
}

const CHART_COLORS = ['#2864dc', '#159c78', '#e4a126', '#db5b50', '#8d62bb', '#3e9db5'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/stats', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: Stats) => setStats(data))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch stats:', error);
          setStats(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const statsConfig = [
    {
      name: 'Total Articles',
      value: stats?.articles || 0,
      icon: FileText,
      color: 'var(--icon-blue)',
    },
    {
      name: 'Auteurs',
      value: stats?.authors || 0,
      icon: Users,
      color: 'var(--icon-green)',
    },
    {
      name: 'Catégories',
      value: stats?.categories || 0,
      icon: FolderTree,
      color: 'var(--icon-purple)',
    },
    {
      name: 'Lives',
      value: stats?.lives || 0,
      icon: Radio,
      color: 'var(--icon-red)',
    },
  ];
  const publicationTrend = stats?.publicationTrend || [];
  const maxDailyPublications = Math.max(1, ...publicationTrend.map((day) => day.count));
  const categoryDistribution = stats?.categoryDistribution || [];
  const maxCategoryArticles = Math.max(1, ...categoryDistribution.map((category) => category.count));

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-7">
          <header className="flex flex-col gap-5 border-b border-[var(--card-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase text-secondary">MalakInfo · Rédaction</p>
              <h1 className="text-2xl font-bold text-primary sm:text-3xl">Tableau de bord</h1>
              <p className="mt-1.5 text-sm text-secondary">Vue d’ensemble de votre activité éditoriale.</p>
            </div>
            <Link
              href="/articles/new"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Plus className="h-4 w-4" />
              Nouvel article
            </Link>
          </header>

          <section aria-label="Indicateurs principaux" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="card rounded-lg border p-5 shadow-sm" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="animate-pulse">
                    <div className="mb-3 h-3 w-1/2 rounded bg-gray-200"></div>
                    <div className="h-8 w-1/3 rounded bg-gray-200"></div>
                  </div>
                </div>
              ))
            ) : (
              statsConfig.map((stat) => {
                const Icon = stat.icon;
                return (
                  <article key={stat.name} className="card rounded-lg border p-5 shadow-sm transition-shadow hover:shadow-md" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary">{stat.name}</p>
                        <p className="mt-2 text-3xl font-bold leading-none text-primary">{stat.value.toLocaleString('fr-FR')}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ color: stat.color, backgroundColor: `color-mix(in srgb, ${stat.color} 12%, transparent)` }}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-5 h-px w-full" style={{ backgroundColor: 'var(--card-border)' }} />
                  </article>
                );
              })
            )}
          </section>

          <section aria-label="Indicateurs éditoriaux" className="grid grid-cols-1 overflow-hidden rounded-lg border sm:grid-cols-3" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
            {[
              { label: 'Articles à la une', value: stats?.featuredArticles ?? 0, color: 'var(--icon-purple)' },
              { label: 'Publiés ce mois', value: stats?.publishedThisMonth ?? 0, color: 'var(--icon-green)' },
              { label: 'Vues totales', value: stats?.totalViews ?? 0, color: 'var(--icon-blue)' },
            ].map((item) => (
              <div key={item.label} className="border-b p-4 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-5" style={{ borderColor: 'var(--card-border)' }}>
                <p className="text-sm text-secondary">{item.label}</p>
                <p className="mt-1.5 text-xl font-semibold tabular-nums" style={{ color: item.color }}>{item.value.toLocaleString('fr-FR')}</p>
              </div>
            ))}
          </section>

          <div className="grid gap-5 xl:grid-cols-2">
            <section aria-labelledby="publication-chart-heading" className="card min-w-0 rounded-lg border p-5 shadow-sm sm:p-6" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="publication-chart-heading" className="text-base font-semibold text-primary">Publications</h2>
                  <p className="mt-1 text-sm text-secondary">Les 7 derniers jours</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)' }}>
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              {loading ? (
                <div className="mt-7 flex h-44 items-end gap-3 animate-pulse" aria-hidden="true">
                  {[48, 72, 39, 88, 57, 78, 46].map((height, index) => (
                    <div key={index} className="flex-1 rounded-t-md bg-gray-200" style={{ height: `${height}%` }} />
                  ))}
                </div>
              ) : publicationTrend.some((day) => day.count > 0) ? (
                <div className="mt-5 grid h-44 grid-cols-7 items-end gap-2 sm:gap-3" role="list" aria-label="Nombre d’articles publiés par jour">
                  {publicationTrend.map((day, index) => {
                    const height = Math.max(5, (day.count / maxDailyPublications) * 100);
                    const dateLabel = `${day.date.slice(8, 10)}/${day.date.slice(5, 7)}`;
                    return (
                      <div key={day.date} className="flex h-full min-w-0 flex-col items-center justify-end gap-2" role="listitem" aria-label={`${day.count} publication(s), ${dateLabel}`}>
                        <span className="text-xs font-semibold tabular-nums text-secondary">{day.count}</span>
                        <div className="flex h-28 w-full items-end overflow-hidden rounded-md bg-gray-100 sm:h-32" aria-hidden="true">
                          <div className="w-full rounded-md transition-[height] duration-500" style={{ height: `${height}%`, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                        </div>
                        <span className="text-[10px] tabular-nums text-secondary sm:text-xs">{dateLabel}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-8 flex h-36 items-center justify-center text-sm text-secondary">Aucune publication sur cette période.</p>
              )}
            </section>

            <section aria-labelledby="category-chart-heading" className="card min-w-0 rounded-lg border p-5 shadow-sm sm:p-6" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="category-chart-heading" className="text-base font-semibold text-primary">Articles par catégorie</h2>
                  <p className="mt-1 text-sm text-secondary">Répartition du catalogue</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <FolderTree className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              {loading ? (
                <div className="mt-7 space-y-5 animate-pulse" aria-hidden="true">
                  {[92, 68, 80, 52, 73].map((width, index) => (
                    <div key={index}>
                      <div className="mb-2 h-3 w-1/3 rounded bg-gray-200" />
                      <div className="h-2 rounded-full bg-gray-200" style={{ width: `${width}%` }} />
                    </div>
                  ))}
                </div>
              ) : categoryDistribution.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {categoryDistribution.map((category, index) => (
                    <div key={category.name}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate font-medium text-primary">{category.name}</span>
                        <span className="shrink-0 tabular-nums text-secondary">{category.count.toLocaleString('fr-FR')}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100" role="img" aria-label={`${category.name}: ${category.count} article(s)`}>
                        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(category.count / maxCategoryArticles) * 100}%`, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-8 flex h-36 items-center justify-center text-sm text-secondary">Aucune catégorie disponible.</p>
              )}
            </section>
          </div>

          <section aria-labelledby="shortcuts-heading">
            <h2 id="shortcuts-heading" className="mb-3 text-base font-semibold text-primary">Accès rapide</h2>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Ajouter un auteur', href: '/authors/new', icon: Users },
                { label: 'Créer un live', href: '/lives/new', icon: Radio },
                { label: 'Nouvelle catégorie', href: '/categories/new', icon: FolderTree },
                { label: 'Gérer les articles', href: '/articles', icon: FileText },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex min-h-12 items-center gap-3 rounded-lg border px-3.5 py-3 text-sm font-medium text-primary transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                  >
                    <Icon className="h-4 w-4 text-secondary transition-colors group-hover:text-primary" />
                    <span className="flex-1">{action.label}</span>
                    <ArrowRight className="h-4 w-4 text-secondary transition-transform group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
