'use client';

import { usePathname } from 'next/navigation';
import { X, Newspaper, ScrollText, Radio, BookOpen, ChevronRight, Home } from 'lucide-react';
import { useServicesModal } from '@/contexts/ServicesModalContext';
import { useState, useEffect } from 'react';
import frMessages from '../../messages/fr.json';
import enMessages from '../../messages/en.json';

export default function ServicesModal() {
  const pathname = usePathname();
  const { isServicesOpen, closeServices } = useServicesModal();
  const locale = pathname.split('/')[1] || 'fr';
  const t = locale === 'fr' ? frMessages.nav : enMessages.nav;
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

  const servicesItems = [
    { name: t.search, href: `/${locale}/recherche` },
    { name: t.pressReleases, href: `/${locale}/communiques` },
    { name: t.archives, href: `/${locale}/archives` },
    { name: t.radioAfrica, href: `/${locale}/radio-afrique` },
    { name: t.scienceTech, href: `/${locale}/science-tech` },
    { name: t.forumAfrica, href: `/${locale}/forum-afrique` },
    { name: t.partnerships, href: `/${locale}/partenariats` },
    { name: t.practicalInfo, href: `/${locale}/infos-pratiques` },
    { name: t.media, href: `/${locale}/medias` },
    { name: t.blog, href: `/${locale}/blog` },
    { name: t.employment, href: `/${locale}/emploi` },
    { name: t.support, href: `/${locale}/nous-soutenir` },
    { name: t.contact, href: `/${locale}/contact` },
    { name: t.religion, href: `/${locale}/religion` },
    { name: t.sport, href: `/${locale}/sport` },
    { name: t.culture, href: `/${locale}/culture` },
    { name: t.music, href: `/${locale}/culture/musique` },
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
        { name: t.politics, href: `/${locale}/actualites/politique` },
        { name: t.economy, href: `/${locale}/actualites/economie` },
        { name: t.society, href: `/${locale}/actualites/societe` },
        { name: t.health, href: `/${locale}/actualites/sante` },
        { name: t.security, href: `/${locale}/actualites/securite` },
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

  if (!isServicesOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeServices}
      />

      {/* Mobile Bottom Sheet */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ease-out ${
        isAnimating ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-white rounded-none max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b-2 border-[#D4AF37] flex justify-between items-center">
            <h3 className="text-[#081C3D] font-bold uppercase tracking-wide">{t.servicesMalakin}</h3>
            <button
              onClick={closeServices}
              className="flex items-center gap-2 text-[#081C3D] hover:text-[#D4AF37] transition-colors"
            >
              <span className="text-sm font-bold uppercase">FERMER</span>
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Menu Categories */}
          <div className="p-4 space-y-0">
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

          {/* Services Grid */}
          <div className="border-t border-gray-200 p-4">
            <h4 className="text-[#081C3D] font-bold text-sm uppercase tracking-wide mb-3">Services</h4>
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
        </div>
      </div>

      {/* Desktop Dropdown */}
      <div className="hidden md:block">
        <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`} onClick={closeServices} />
        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] bg-white border border-gray-200 rounded-none shadow-2xl p-6 z-50 max-h-[80vh] overflow-y-auto transition-all duration-300 ease-out ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}>
          <div className="flex justify-between items-center mb-4 border-b-2 border-[#D4AF37] pb-4">
            <h3 className="text-[#081C3D] font-bold uppercase tracking-wide">{t.servicesMalakin}</h3>
            <button
              className="flex items-center gap-2 text-[#081C3D] hover:text-[#D4AF37] transition-colors"
              onClick={closeServices}
            >
              <span className="text-sm font-bold uppercase">FERMER</span>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Menu Categories */}
          <div className="mb-6 space-y-0">
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

          {/* Services Grid */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-[#081C3D] font-bold text-sm uppercase tracking-wide mb-3">Services</h4>
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
        </div>
      </div>
    </>
  );
}
