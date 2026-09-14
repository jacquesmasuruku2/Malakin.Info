'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronRight } from 'lucide-react';
import { useServicesModal } from '@/contexts/ServicesModalContext';
import { useState, useEffect } from 'react';
import { getLocaleFromPathname, getMessages } from '@/lib/i18n';

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
              key={category.title}
              href={category.href}
              onClick={closeServices}
              className="block px-3 py-4 text-base font-bold uppercase tracking-wide text-[#081C3D] hover:text-[#D4AF37] border-b border-gray-200 transition-colors"
            >
              {category.title}
            </Link>
          );
        }

        const isExpanded = expandedCategory === category.title;
        return (
          <div key={category.title} className="border-b border-gray-200">
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-4 text-base font-bold uppercase tracking-wide text-[#081C3D] hover:text-[#D4AF37] transition-colors"
              onClick={() => setExpandedCategory(isExpanded ? null : category.title)}
            >
              <span>{category.title}</span>
              <ChevronRight
                className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-[min(20rem,45vh)] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {isExpanded && category.items && (
                <div className="pl-4 pr-3 py-2 space-y-1 bg-gray-50 max-h-[min(20rem,45vh)] overflow-y-auto">
                  {category.items.map((item) => (
                    <Link
                      key={`${item.href}-${item.name}`}
                      href={item.href}
                      onClick={closeServices}
                      className="block px-3 py-2 text-sm text-[#081C3D] hover:text-[#D4AF37] transition-colors"
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

        const items = (data as CategoryPayload[])
          .filter((category) => category.slug && category.slug !== 'actualites')
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
          .map(({ name, href }) => ({ name, href }));

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

  const servicesItems: MenuLink[] = [
    { name: t.contact, href: `/${locale}/contact` },
    { name: t.employment, href: `/${locale}/emploi` },
    { name: t.media, href: `/${locale}/medias` },
    { name: t.music, href: `/${locale}/culture/musique` },
    { name: t.partnerships, href: `/${locale}/partenaires` },
    { name: t.scienceTech, href: `/${locale}/science-tech` },
    { name: t.search, href: `/${locale}/recherche` },
    { name: t.support, href: `/${locale}/nous-soutenir` },
  ];

  const menuCategories: MenuSection[] = [
    {
      title: t.home,
      href: `/${locale}`,
    },
    {
      title: t.news,
      items: [
        { name: t.allNews, href: `/${locale}/actualites` },
        ...(newsCategories ?? fallbackNewsCategories),
      ],
    },
    {
      title: t.media,
      items: [
        { name: locale === 'fr' ? 'Diffusion en direct' : 'Live broadcasts', href: `/${locale}/diffusion-en-direct` },
        { name: t.photos, href: `/${locale}/medias/photos` },
        { name: t.videos, href: `/${locale}/medias/videos` },
        { name: t.podcasts, href: `/${locale}/medias/podcasts` },
        { name: t.live, href: `/${locale}/medias/live` },
      ],
    },
    {
      title: t.religion,
      items: [
        { name: t.meditations, href: `/${locale}/religion/meditations` },
        { name: t.homilies, href: `/${locale}/religion/homelies` },
        { name: t.sacredMusic, href: `/${locale}/religion/musiques-sacrees` },
        { name: t.religiousAgenda, href: `/${locale}/religion/agenda-religieux` },
        { name: t.messageOfTime, href: `/${locale}/religion/message-du-temps` },
      ],
    },
    {
      title: t.culture,
      items: [
        { name: t.music, href: `/${locale}/culture/musique` },
        { name: t.cinema, href: `/${locale}/culture/cinema` },
        { name: t.arts, href: `/${locale}/culture/arts` },
        { name: t.trends, href: `/${locale}/culture/tendances` },
      ],
    },
    {
      title: t.sport,
      items: [
        { name: t.football, href: `/${locale}/sport/football` },
        { name: t.basketball, href: `/${locale}/sport/basket` },
        { name: t.athletics, href: `/${locale}/sport/athletisme` },
        { name: t.events, href: `/${locale}/sport/evenements` },
      ],
    },
    {
      title: t.scienceTech,
      items: [
        { name: t.database, href: `/${locale}/science-tech/base-de-donnees` },
        { name: t.dataAnalysis, href: `/${locale}/science-tech/analyse-de-donnees` },
        { name: t.natureEnvironment, href: `/${locale}/science-tech/nature-environnement` },
      ],
    },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity duration-300 ${
          isServicesOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeServices}
      />

      <div className={`fixed bottom-0 left-0 right-0 z-[70] md:hidden transition-transform duration-300 ease-out ${
        isServicesOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-white rounded-none max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b-2 border-[#D4AF37] flex justify-between items-center">
            <h3 className="text-[#081C3D] font-bold uppercase tracking-wide">{t.servicesMalakin}</h3>
            <button
              type="button"
              onClick={closeServices}
              className="flex items-center gap-2 text-[#081C3D] hover:text-[#D4AF37] transition-colors"
            >
              <span className="text-sm font-bold uppercase">{t.close.toUpperCase()}</span>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid gap-3 p-4 grid-cols-2">
            <div>
              <h4 className="text-[#081C3D] font-bold text-sm uppercase tracking-wide mb-3">{t.services}</h4>
              <div className="grid gap-2">
                {servicesItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeServices}
                    className="block min-h-[44px] items-center px-3 py-2.5 bg-gray-50 rounded-lg text-sm text-[#081C3D] hover:bg-[#D4AF37] hover:text-white transition-all duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[#081C3D] font-bold text-sm uppercase tracking-wide mb-3">Malakinfo Services</h4>
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

      <div className="hidden md:block">
        <div className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isServicesOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} onClick={closeServices} />
        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[760px] max-w-[90vw] bg-white border border-gray-200 rounded-none shadow-2xl p-6 z-[70] max-h-[80vh] overflow-y-auto transition-all duration-300 ease-out ${
          isServicesOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}>
          <div className="flex justify-between items-center mb-4 border-b-2 border-[#D4AF37] pb-4">
            <h3 className="text-[#081C3D] font-bold uppercase tracking-wide">{t.servicesMalakin}</h3>
            <button
              type="button"
              className="flex items-center gap-2 text-[#081C3D] hover:text-[#D4AF37] transition-colors"
              onClick={closeServices}
            >
              <span className="text-sm font-bold uppercase">{t.close.toUpperCase()}</span>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="text-[#081C3D] font-bold text-sm uppercase tracking-wide mb-3">{t.services}</h4>
              <div className="space-y-2">
                {servicesItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeServices}
                    className="block px-3 py-2 text-sm text-[#081C3D] hover:text-[#D4AF37] transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[#081C3D] font-bold text-sm uppercase tracking-wide mb-3">Malakinfo Services</h4>
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
