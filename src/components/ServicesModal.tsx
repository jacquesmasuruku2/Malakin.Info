'use client';

import { usePathname } from 'next/navigation';
import { X, Newspaper, ScrollText, Radio, BookOpen, ChevronRight, Home } from 'lucide-react';
import { useServicesModal } from '@/contexts/ServicesModalContext';
import { useState, useEffect } from 'react';
import { getLocaleFromPathname, getMessages } from '@/lib/i18n';

export default function ServicesModal() {
  const pathname = usePathname();
  const { isServicesOpen, closeServices } = useServicesModal();
  const locale = getLocaleFromPathname(pathname);
  const t = getMessages(locale).nav;
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle animation when modal opens/closes
  useEffect(() => {
    if (isServicesOpen) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isServicesOpen]);

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

  const servicesItems = [
    { name: t.contact, href: `/${locale}/contact` },
    { name: t.employment, href: `/${locale}/emploi` },
    { name: t.media, href: `/${locale}/medias` },
    { name: t.music, href: `/${locale}/culture/musique` },
    { name: t.partnerships, href: `/${locale}/partenariats` },
    { name: t.scienceTech, href: `/${locale}/science-tech` },
    { name: t.search, href: `/${locale}/recherche` },
    { name: t.support, href: `/${locale}/nous-soutenir` },
  ];

  const menuCategories = [
    {
      title: t.home,
      href: `/${locale}`,
    },
    {
      title: t.news,
      items: [
        { name: t.allNews, href: `/${locale}/actualites` },
        { name: t.politics, href: `/${locale}/politique` },
        { name: t.economy, href: `/${locale}/economie` },
        { name: t.society, href: `/${locale}/societe` },
        { name: t.health, href: `/${locale}/sante` },
        { name: t.security, href: `/${locale}/securite` },
      ],
    },
    {
      title: t.media,
      items: [
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
        { name: t.basketball, href: `/${locale}/sport/basketball` },
        { name: t.athletics, href: `/${locale}/sport/athletisme` },
        { name: t.tennis, href: `/${locale}/sport/tennis` },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity duration-300 ${
          isServicesOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeServices}
      />

      {/* Mobile Bottom Sheet */}
      <div className={`fixed bottom-0 left-0 right-0 z-[70] md:hidden transition-transform duration-300 ease-out ${
        isServicesOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-white rounded-none max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b-2 border-[#D4AF37] flex justify-between items-center">
            <h3 className="text-[#081C3D] font-bold uppercase tracking-wide">{t.servicesMalakin}</h3>
            <button
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
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={closeServices}
                    className="block min-h-[44px] items-center px-3 py-2.5 bg-gray-50 rounded-lg text-sm text-[#081C3D] hover:bg-[#D4AF37] hover:text-white transition-all duration-200"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[#081C3D] font-bold text-sm uppercase tracking-wide mb-3">Malakinfo Services</h4>
              <div className="space-y-0">
                {menuCategories.map((category) => {
                  if (category.href) {
                    return (
                      <a
                        key={category.title}
                        href={category.href}
                        onClick={closeServices}
                        className="block px-3 py-4 text-base font-bold uppercase tracking-wide text-[#081C3D] hover:text-[#D4AF37] border-b border-gray-200 transition-colors"
                      >
                        {category.title}
                      </a>
                    );
                  }

                  const isExpanded = expandedCategory === category.title;
                  return (
                    <div key={category.title} className="border-b border-gray-200">
                      <button
                        className="w-full flex items-center justify-between px-3 py-4 text-base font-bold uppercase tracking-wide text-[#081C3D] hover:text-[#D4AF37] transition-colors"
                        onClick={() => setExpandedCategory(isExpanded ? null : category.title)}
                      >
                        <span>{category.title}</span>
                        <ChevronRight
                          className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </button>

                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        {isExpanded && category.items && (
                          <div className="pl-4 pr-3 py-2 space-y-1 bg-gray-50">
                            {category.items.map((item) => (
                              <a
                                key={item.name}
                                href={item.href}
                                onClick={closeServices}
                                className="block px-3 py-2 text-sm text-[#081C3D] hover:text-[#D4AF37] transition-colors"
                              >
                                {item.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Dropdown */}
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
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={closeServices}
                    className="block px-3 py-2 text-sm text-[#081C3D] hover:text-[#D4AF37] transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[#081C3D] font-bold text-sm uppercase tracking-wide mb-3">Malakinfo Services</h4>
              <div className="space-y-0">
                {menuCategories.map((category) => {
                  if (category.href) {
                    return (
                      <a
                        key={category.title}
                        href={category.href}
                        onClick={closeServices}
                        className="block px-3 py-4 text-base font-bold uppercase tracking-wide text-[#081C3D] hover:text-[#D4AF37] border-b border-gray-200 transition-colors"
                      >
                        {category.title}
                      </a>
                    );
                  }

                  const isExpanded = expandedCategory === category.title;
                  return (
                    <div key={category.title} className="border-b border-gray-200">
                      <button
                        className="w-full flex items-center justify-between px-3 py-4 text-base font-bold uppercase tracking-wide text-[#081C3D] hover:text-[#D4AF37] transition-colors"
                        onClick={() => setExpandedCategory(isExpanded ? null : category.title)}
                      >
                        <span>{category.title}</span>
                        <ChevronRight
                          className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </button>

                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        {isExpanded && category.items && (
                          <div className="pl-4 pr-3 py-2 space-y-1 bg-gray-50">
                            {category.items.map((item) => (
                              <a
                                key={item.name}
                                href={item.href}
                                onClick={closeServices}
                                className="block px-3 py-2 text-sm text-[#081C3D] hover:text-[#D4AF37] transition-colors"
                              >
                                {item.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
