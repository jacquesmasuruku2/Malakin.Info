'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronRight } from 'lucide-react';
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
  compact = false,
}: {
  sections: MenuSection[];
  expandedCategory: string | null;
  setExpandedCategory: (title: string | null) => void;
  closeServices: () => void;
  compact?: boolean;
}) {
  const titleClass = compact
    ? 'px-2.5 py-2.5 text-[13px] font-bold uppercase tracking-[0.08em]'
    : 'px-3 py-3 text-sm font-bold uppercase tracking-wide';
  const itemClass = compact
    ? 'block rounded-md px-2.5 py-2 text-[13px] leading-snug text-foreground transition-colors hover:bg-muted hover:text-secondary'
    : 'block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-secondary';

  return (
    <div className="space-y-0">
      {sections.map((category) => {
        if (category.href) {
          return (
            <Link
              key={category.href || category.title}
              href={category.href}
              onClick={closeServices}
              className={`block border-b border-border text-foreground transition-colors hover:text-secondary ${titleClass}`}
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
              className={`flex w-full items-center justify-between text-foreground transition-colors hover:text-secondary ${titleClass}`}
              onClick={() => setExpandedCategory(isExpanded ? null : category.title)}
            >
              <span>{category.title}</span>
              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-[min(16rem,40vh)] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {isExpanded && category.items && (
                <div className="max-h-[min(16rem,40vh)] space-y-0.5 overflow-y-auto bg-muted px-2 py-1.5">
                  {category.items.map((item) => (
                    <Link
                      key={`${item.href}-${item.name}`}
                      href={item.href}
                      onClick={closeServices}
                      className={itemClass}
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
    {
      title: t.home,
      href: `/${locale}`,
    },
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
      items: [
        {
          name: locale === 'fr' ? 'Toutes les infos' : 'All practical info',
          href: `/${locale}/infos-pratiques`,
        },
      ],
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
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 md:hidden ${
          isServicesOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeServices}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-[70] md:hidden transition-transform duration-300 ease-out ${
          isServicesOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex max-h-[min(92dvh,100%)] flex-col overflow-hidden rounded-t-2xl border-t border-border bg-background pb-[max(0.75rem,env(safe-area-inset-bottom))] text-foreground">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b-2 border-secondary bg-background px-3 py-2.5">
            <h3 className="min-w-0 truncate text-[13px] font-bold uppercase tracking-[0.08em] text-foreground">
              {t.servicesMalakin}
            </h3>
            <button
              type="button"
              onClick={closeServices}
              className="inline-flex shrink-0 items-center gap-1.5 text-foreground transition-colors hover:text-secondary"
            >
              <span className="text-[11px] font-bold uppercase">{t.close.toUpperCase()}</span>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-3">
            <div>
              <h4 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {t.services}
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {servicesItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeServices}
                    className="flex min-h-10 items-center rounded-lg bg-muted px-2.5 py-2 text-[12px] leading-snug text-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
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
                compact
              />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div
          className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
            isServicesOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={closeServices}
        />
        <div
          className={`fixed left-1/2 top-1/2 z-[70] w-[min(760px,92vw)] max-h-[min(80vh,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card p-5 text-foreground shadow-2xl transition-all duration-300 ease-out sm:p-6 ${
            isServicesOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
          }`}
        >
          <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-secondary pb-4">
            <h3 className="text-base font-bold uppercase tracking-wide text-foreground">{t.servicesMalakin}</h3>
            <button
              type="button"
              className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-secondary"
              onClick={closeServices}
            >
              <span className="text-sm font-bold uppercase">{t.close.toUpperCase()}</span>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">{t.services}</h4>
              <div className="space-y-1">
                {servicesItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeServices}
                    className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-secondary"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Malakinfo Services</h4>
              <MenuTree
                sections={menuCategories}
                expandedCategory={expandedCategory}
                setExpandedCategory={setExpandedCategory}
                closeServices={closeServices}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
