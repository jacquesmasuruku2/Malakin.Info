'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useServicesModal } from '@/contexts/ServicesModalContext';
import { useState, useEffect } from 'react';
import { getLocaleFromPathname, getMessages } from '@/lib/i18n';
import { isMenuHubSlug, uniqueMenuLinks } from '@/lib/menu';

type MenuLink = { name: string; href: string };
type MenuSection = { title: string; href?: string; items?: MenuLink[] };

type CategoryPayload = {
  slug?: string;
  title?: string;
  articleCount?: number;
};

function MenuTree({
  sections,
  expandedCategory,
  setExpandedCategory,
  closeServices,
}: {
  sections: MenuSection[];
  expandedCategory: string | null;
  setExpandedCategory: (title: string | null) => void;
  closeServices: () => void;
}) {
  return (
    <div className="space-y-0">
      {sections.map((category) => {
        if (category.href) {
          return (
            <Link
              key={category.href || category.title}
              href={category.href}
              onClick={closeServices}
              className="block border-b border-border px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:text-secondary"
            >
              {category.title}
            </Link>
          );
        }

        const isExpanded = expandedCategory === category.title;
        return (
          <div key={category.title} className="border-b border-border">
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:text-secondary"
              onClick={() => setExpandedCategory(isExpanded ? null : category.title)}
            >
              <span>{category.title}</span>
              <span
                className={`text-xs text-muted-foreground transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              >
                ›
              </span>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-[min(16rem,40vh)] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {isExpanded && category.items && (
                <div className="space-y-0.5 bg-muted px-2 py-2">
                  {category.items.map((item) => (
                    <Link
                      key={`${item.href}-${item.name}`}
                      href={item.href}
                      onClick={closeServices}
                      className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary/10 hover:text-secondary"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ServicesModal() {
  const pathname = usePathname();
  const { isServicesOpen, closeServices } = useServicesModal();
  const locale = getLocaleFromPathname(pathname);
  const t = getMessages(locale).nav;
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [newsCategories, setNewsCategories] = useState<MenuLink[] | null>(null);

  useEffect(() => {
    if (!isServicesOpen) {
      setExpandedCategory(null);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeServices();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isServicesOpen, closeServices]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch(`/api/categories?locale=${encodeURIComponent(locale)}`);
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled || !Array.isArray(data)) return;

        const items = uniqueMenuLinks(
          (data as CategoryPayload[])
            .filter((category) => category.slug && !isMenuHubSlug(category.slug))
            .map((category) => ({
              name: category.title || category.slug || '',
              href: `/${locale}/${category.slug}`,
              articleCount: category.articleCount ?? 0,
            }))
            .sort((a, b) => {
              if (b.articleCount !== a.articleCount) {
                return b.articleCount - a.articleCount;
              }
              return a.name.localeCompare(b.name, locale);
            })
            .map(({ name, href }) => ({ name, href }))
        );

        setNewsCategories(items);
      } catch {
        if (!cancelled) {
          setNewsCategories(null);
        }
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const fallbackNewsCategories: MenuLink[] = [
    { name: t.politics, href: `/${locale}/politique` },
    { name: t.economy, href: `/${locale}/economie` },
    { name: t.society, href: `/${locale}/societe` },
    { name: t.health, href: `/${locale}/sante` },
    { name: t.security, href: `/${locale}/securite` },
  ];

  const menuCategories: MenuSection[] = [
    { title: t.home, href: `/${locale}` },
    {
      title: t.news,
      items: uniqueMenuLinks([
        { name: t.allNews, href: `/${locale}/actualites` },
        ...(newsCategories ?? fallbackNewsCategories),
      ]),
    },
    {
      title: t.media,
      items: [
        { name: locale === 'fr' ? 'Tous les médias' : 'All media', href: `/${locale}/medias` },
        { name: locale === 'fr' ? 'Diffusion en direct' : 'Live broadcasts', href: `/${locale}/diffusion-en-direct` },
        { name: t.videos, href: `/${locale}/medias/videos` },
        { name: t.live, href: `/${locale}/medias/live` },
      ],
    },
    {
      title: t.religion,
      items: [
        { name: locale === 'fr' ? 'Toute la rubrique' : 'All religion', href: `/${locale}/religion` },
        {
          name: locale === 'fr' ? 'Sermons Branham' : 'Branham sermons',
          href: `/${locale}/religion/message-du-temps/branham/sermons`,
        },
      ],
    },
    {
      title: t.culture,
      items: [{ name: locale === 'fr' ? 'Toute la culture' : 'All culture', href: `/${locale}/culture` }],
    },
    {
      title: t.sport,
      items: [{ name: locale === 'fr' ? 'Tout le sport' : 'All sport', href: `/${locale}/sport` }],
    },
    {
      title: t.scienceTech,
      items: [
        { name: locale === 'fr' ? 'Toute la rubrique' : 'All science & tech', href: `/${locale}/science-tech` },
        { name: t.natureEnvironment, href: `/${locale}/science-tech/nature-environnement` },
      ],
    },
    {
      title: t.practicalInfo,
      items: [{ name: locale === 'fr' ? 'Toutes les infos' : 'All practical info', href: `/${locale}/infos-pratiques` }],
    },
  ];

  const reservedHrefs = new Set(
    menuCategories.flatMap((section) => [
      ...(section.href ? [section.href] : []),
      ...(section.items?.map((item) => item.href) ?? []),
    ])
  );

  const servicesItems = uniqueMenuLinks([
    { name: t.contact, href: `/${locale}/contact` },
    { name: t.employment, href: `/${locale}/emploi` },
    { name: t.search, href: `/${locale}/recherche` },
    { name: t.partnerships, href: `/${locale}/partenaires` },
    { name: t.support, href: `/${locale}/nous-soutenir` },
  ]).filter((item) => !reservedHrefs.has(item.href));

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          isServicesOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeServices}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-[88vw] max-w-[420px] border-r border-border bg-background text-foreground shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out ${
          isServicesOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label={t.servicesMalakin}
      >
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
          <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-foreground">
            {t.servicesMalakin}
          </h3>
          <button
            type="button"
            onClick={closeServices}
            className="inline-flex items-center gap-1.5 rounded-md p-2 text-foreground transition-colors hover:bg-muted hover:text-secondary"
            aria-label={t.close}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.12em]">{t.close}</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-[calc(100vh-57px)] overflow-y-auto px-4 py-4">
          <div className="mb-6">
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {t.services}
            </h4>
            <div className="space-y-2">
              {servicesItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeServices}
                  className="block rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground transition-colors hover:border-secondary/60 hover:bg-secondary/10 hover:text-secondary"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Malakinfo Services
            </h4>
            <MenuTree
              sections={menuCategories}
              expandedCategory={expandedCategory}
              setExpandedCategory={setExpandedCategory}
              closeServices={closeServices}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
