'use client';

import { usePathname } from 'next/navigation';
import { X, Search, Newspaper, ScrollText, Radio, FlaskConical, BookOpen, Briefcase, DollarSign, Mail, Grid3x3, Info, Trophy, Palette, Music, ChevronRight, Home } from 'lucide-react';
import { useServicesModal } from '@/contexts/ServicesModalContext';
import { useState } from 'react';
import frMessages from '../../messages/fr.json';
import enMessages from '../../messages/en.json';

export default function ServicesModal() {
  const pathname = usePathname();
  const { isServicesOpen, closeServices } = useServicesModal();
  const locale = pathname.split('/')[1] || 'fr';
  const t = locale === 'fr' ? frMessages.nav : enMessages.nav;
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const servicesItems = [
    { icon: Grid3x3, name: t.search, href: `/${locale}/recherche`, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
    { icon: Newspaper, name: t.pressReleases, href: `/${locale}/communiques`, color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
    { icon: ScrollText, name: t.archives, href: `/${locale}/archives`, color: 'bg-amber-500/20', iconColor: 'text-amber-400' },
    { icon: Radio, name: t.radioAfrica, href: `/${locale}/radio-afrique`, color: 'bg-red-500/20', iconColor: 'text-red-400' },
    { icon: FlaskConical, name: t.scienceTech, href: `/${locale}/science-tech`, color: 'bg-cyan-500/20', iconColor: 'text-cyan-400' },
    { icon: BookOpen, name: t.forumAfrica, href: `/${locale}/forum-afrique`, color: 'bg-green-500/20', iconColor: 'text-green-400' },
    { icon: Briefcase, name: t.partnerships, href: `/${locale}/partenariats`, color: 'bg-pink-500/20', iconColor: 'text-pink-400' },
    { icon: Info, name: t.practicalInfo, href: `/${locale}/infos-pratiques`, color: 'bg-indigo-500/20', iconColor: 'text-indigo-400' },
    { icon: Radio, name: t.media, href: `/${locale}/medias`, color: 'bg-orange-500/20', iconColor: 'text-orange-400' },
    { icon: BookOpen, name: t.blog, href: `/${locale}/blog`, color: 'bg-teal-500/20', iconColor: 'text-teal-400' },
    { icon: Briefcase, name: t.employment, href: `/${locale}/emploi`, color: 'bg-lime-500/20', iconColor: 'text-lime-400' },
    { icon: DollarSign, name: t.support, href: `/${locale}/nous-soutenir`, color: 'bg-rose-500/20', iconColor: 'text-rose-400' },
    { icon: Mail, name: t.contact, href: `/${locale}/contact`, color: 'bg-sky-500/20', iconColor: 'text-sky-400' },
    { icon: ScrollText, name: t.religion, href: `/${locale}/religion`, color: 'bg-violet-500/20', iconColor: 'text-violet-400' },
    { icon: Trophy, name: t.sport, href: `/${locale}/sport`, color: 'bg-yellow-500/20', iconColor: 'text-yellow-400' },
    { icon: Palette, name: t.culture, href: `/${locale}/culture`, color: 'bg-fuchsia-500/20', iconColor: 'text-fuchsia-400' },
    { icon: Music, name: t.music, href: `/${locale}/culture/musique`, color: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
  ];

  const menuCategories = [
    {
      title: t.home,
      icon: Home,
      href: `/${locale}`,
    },
    {
      title: t.news,
      icon: Newspaper,
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
      icon: Radio,
      items: [
        { name: t.photos, href: `/${locale}/medias/photos` },
        { name: t.videos, href: `/${locale}/medias/videos` },
        { name: t.podcasts, href: `/${locale}/medias/podcasts` },
        { name: t.live, href: `/${locale}/medias/live` },
      ],
    },
    {
      title: t.religion,
      icon: ScrollText,
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
      icon: Palette,
      items: [
        { name: t.music, href: `/${locale}/culture/musique` },
        { name: t.cinema, href: `/${locale}/culture/cinema` },
        { name: t.arts, href: `/${locale}/culture/arts` },
        { name: t.trends, href: `/${locale}/culture/tendances` },
      ],
    },
    {
      title: t.sport,
      icon: Trophy,
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
        className="fixed inset-0 bg-black/50 z-50 md:hidden"
        onClick={closeServices}
      />

      {/* Mobile Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-[#0f172a] rounded-t-2xl max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-[#0f172a] p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-white font-bold">{t.servicesMalakin}</h3>
            <button
              onClick={closeServices}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Menu Categories */}
          <div className="p-4 space-y-2">
            {menuCategories.map((category) => {
              const Icon = category.icon;
              if (category.href) {
                return (
                  <a
                    key={category.title}
                    href={category.href}
                    onClick={closeServices}
                    className="flex items-center gap-3 px-3 py-3 text-base font-medium text-white hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    {category.title}
                  </a>
                );
              }
              
              const isExpanded = expandedCategory === category.title;
              return (
                <div key={category.title} className="border-b border-gray-700/50">
                  <button
                    className="w-full flex items-center justify-between px-3 py-3 text-base font-medium text-white hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => setExpandedCategory(isExpanded ? null : category.title)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {category.title}
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {isExpanded && category.items && (
                    <div className="pl-8 pr-3 py-2 space-y-1 bg-gray-800/30">
                      {category.items.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={closeServices}
                          className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Services Grid */}
          <div className="border-t border-gray-700 p-4">
            <h4 className="text-white font-bold text-sm mb-3">Services</h4>
            <div className="grid grid-cols-3 gap-4">
              {servicesItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={closeServices}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-2`}>
                      <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <span className="text-xs text-white text-center">{item.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Dropdown */}
      <div className="hidden md:block">
        <div className="fixed inset-0 bg-black/50 z-50" onClick={closeServices} />
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-6 z-50 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-sm">{t.servicesMalakin}</h3>
            <button
              className="text-gray-400 hover:text-white"
              onClick={closeServices}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Menu Categories */}
          <div className="mb-6 space-y-2">
            {menuCategories.map((category) => {
              const Icon = category.icon;
              if (category.href) {
                return (
                  <a
                    key={category.title}
                    href={category.href}
                    onClick={closeServices}
                    className="flex items-center gap-3 px-3 py-3 text-base font-medium text-white hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    {category.title}
                  </a>
                );
              }
              
              const isExpanded = expandedCategory === category.title;
              return (
                <div key={category.title} className="border-b border-gray-700/50">
                  <button
                    className="w-full flex items-center justify-between px-3 py-3 text-base font-medium text-white hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => setExpandedCategory(isExpanded ? null : category.title)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {category.title}
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {isExpanded && category.items && (
                    <div className="pl-8 pr-3 py-2 space-y-1 bg-gray-800/30">
                      {category.items.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={closeServices}
                          className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Services Grid */}
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-white font-bold text-sm mb-3">Services</h4>
            <div className="grid grid-cols-3 gap-4">
              {servicesItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={closeServices}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-2`}>
                      <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <span className="text-xs text-white text-center">{item.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
