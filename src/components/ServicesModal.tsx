'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Briefcase, Home, Search, X } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6';
import { useServicesModal } from '@/contexts/ServicesModalContext';
import { useState, useEffect } from 'react';
import { getLocaleFromPathname, getMessages } from '@/lib/i18n';
import { isMenuHubSlug, uniqueMenuLinks } from '@/lib/menu';

type MenuLink = { name: string; href: string };

type CategoryPayload = {
  slug?: string;
  title?: string;
  articleCount?: number;
};

export default function ServicesModal() {
  const pathname = usePathname();
  const router = useRouter();
  const { isServicesOpen, closeServices } = useServicesModal();
  const locale = getLocaleFromPathname(pathname);
  const t = getMessages(locale).nav;
  const [searchQuery, setSearchQuery] = useState('');
  const [newsCategories, setNewsCategories] = useState<MenuLink[] | null>(null);

  useEffect(() => {
    if (!isServicesOpen) {
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

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    closeServices();
    setSearchQuery('');
    router.push(`/${locale}/recherche?q=${encodeURIComponent(query)}`);
  };

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

  const newsMenuItems = uniqueMenuLinks([
    { name: t.allNews, href: `/${locale}/actualites` },
    ...(newsCategories ?? fallbackNewsCategories),
  ]);

  const otherSections: MenuLink[] = uniqueMenuLinks([
    { name: t.media, href: `/${locale}/medias` },
    { name: t.religion, href: `/${locale}/religion` },
    { name: t.culture, href: `/${locale}/culture` },
    { name: t.sport, href: `/${locale}/sport` },
    { name: t.scienceTech, href: `/${locale}/science-tech` },
    { name: t.practicalInfo, href: `/${locale}/infos-pratiques` },
    { name: t.partnerships, href: `/${locale}/partenaires` },
    { name: t.contact, href: `/${locale}/contact` },
  ]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          isServicesOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeServices}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex h-dvh w-full max-w-[min(100vw,28rem)] flex-col border-r border-border bg-background font-sans text-foreground shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out ${
          isServicesOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label={t.servicesMalakin}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isServicesOpen}
      >
        <header className="flex items-center gap-2 border-b border-border bg-muted/50 px-3 py-2.5">
          <form onSubmit={handleSearch} className="flex min-w-0 flex-1 items-center gap-2">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.search}
              className="h-10 min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground focus:ring-0"
            />
            <button
              type="submit"
              className="sr-only"
              aria-label={t.search}
            >
              {t.search}
            </button>
          </form>
          <button
            type="button"
            onClick={closeServices}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={t.close}
            title={t.close}
          >
            <X className="h-7 w-7" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Link
            href={`/${locale}`}
            onClick={closeServices}
            className="flex min-h-[58px] items-center gap-3 border-b border-border px-5 text-base font-black uppercase text-foreground transition-colors hover:bg-muted"
          >
            <Home className="h-6 w-6 shrink-0" aria-hidden="true" />
            {t.home}
          </Link>

          <section aria-labelledby="mobile-news-heading" className="border-b border-border px-5 py-4">
            <h2 id="mobile-news-heading" className="mb-3 text-base font-black uppercase tracking-[0.12em] text-foreground">
              {t.news}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {newsMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeServices}
                  className="flex min-h-11 items-center py-2 text-[15px] font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="line-clamp-2">{item.name}</span>
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="mobile-employment-heading" className="border-b border-border">
            <div className="flex items-center justify-center gap-3 border-b border-border px-5 py-2.5" aria-label="Réseaux sociaux MalakInfo">
              <a
                href="https://www.facebook.com/profile.php?id=61593119312402"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MalakInfo sur Facebook"
                title="Facebook"
                className="flex h-10 w-12 items-center justify-center rounded-md text-[#1877F2] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <FaFacebookF className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://x.com/Malakinfo1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MalakInfo sur X"
                title="X"
                className="flex h-10 w-12 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <FaXTwitter className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://www.instagram.com/malakinfo/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MalakInfo sur Instagram"
                title="Instagram"
                className="flex h-10 w-12 items-center justify-center rounded-md text-[#E1306C] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <FaInstagram className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
            <Link
              href={`/${locale}/emploi`}
              onClick={closeServices}
              className="flex min-h-12 items-center gap-3 px-5 py-2.5 text-[15px] font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary"
            >
              <Briefcase className="h-5 w-5" aria-hidden="true" />
              {t.employment}
            </Link>
          </section>

          <section aria-label={t.services} className="grid grid-cols-2 gap-x-4 gap-y-1 px-5 py-3">
            {otherSections.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeServices}
                className="flex min-h-11 items-center py-2 text-sm font-semibold text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="line-clamp-2">{item.name}</span>
              </Link>
            ))}
          </section>
        </div>

        <footer className="shrink-0 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            <Link
              href={`/${locale}/compte/connexion`}
              onClick={closeServices}
              className="flex min-h-12 flex-1 items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {locale === 'fr' ? 'Se connecter' : 'Sign in'}
            </Link>
            <Link
              href={`/${locale}/nous-soutenir`}
              onClick={closeServices}
              className="flex min-h-12 flex-1 items-center justify-center rounded-lg bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              {t.subscribe}
            </Link>
          </div>
        </footer>
      </aside>
    </>
  );
}
