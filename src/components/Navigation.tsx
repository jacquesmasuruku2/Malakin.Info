'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Search, User, X, ChevronDown, ChevronRight, Newspaper, DollarSign, FlaskConical, Palette, Trophy, Radio, ScrollText, Briefcase, BookOpen, Info, Mail, Grip, LogOut, Settings, Heart, MessageSquare, Bookmark, Menu } from 'lucide-react';
import SearchBar from './SearchBar';
import LanguageSwitcher from './LanguageSwitcher';
import { useServicesModal } from '@/contexts/ServicesModalContext';
import { getMessages, getLocaleFromPathname } from '@/lib/i18n';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isServicesOpen, openServices, closeServices, toggleServices } = useServicesModal();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const locale = getLocaleFromPathname(pathname);
  const t = getMessages(locale).nav;
  const [localUser, setLocalUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setLocalUser(JSON.parse(storedUser));
      } catch {
        setLocalUser(null);
      }
    }
  }, []);

  const activeUser = session?.user ?? localUser;

  // detect mobile viewport
  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window === 'undefined') return;
      setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    };
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  // No extra topbar hidden behavior: the utility strip remains visible and lightweight.

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    await signOut({ callbackUrl: '/' });
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleMenuToggle = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
    toggleServices();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const mainNavItems = [
    { name: t.home, href: `/${locale}` },
    { name: t.news, href: `/${locale}/actualites` },
    { name: t.economy, href: `/${locale}/economie` },
    { name: t.scienceTech, href: `/${locale}/science-tech` },
    { name: t.culture, href: `/${locale}/culture` },
    { name: t.sport, href: `/${locale}/sport` },
    { name: t.supportUs, href: `/${locale}/nous-soutenir` },
  ];

  const dropdownItems = [
    { name: t.media, href: `/${locale}/medias` },
    { name: t.pressReleases, href: `/${locale}/communiques` },
    { name: t.practicalInfo, href: `/${locale}/infos-pratiques` },
    { name: t.religion, href: `/${locale}/religion` },
    { name: t.employment, href: `/${locale}/emploi` },
    { name: t.blog, href: `/${locale}/blog` },
    { name: t.about, href: `/${locale}/a-propos` },
    { name: t.contact, href: `/${locale}/contact` },
  ];

  const mobileMenuCategories = [
    {
      title: t.news,
      icon: Newspaper,
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
        { name: t.basketball, href: `/${locale}/sport/basket` },
        { name: t.athletics, href: `/${locale}/sport/athletisme` },
        { name: t.events, href: `/${locale}/sport/evenements` },
      ],
    },
    {
      title: t.scienceTech,
      icon: FlaskConical,
      items: [
        { name: t.database, href: `/${locale}/science-tech/base-de-donnees` },
        { name: t.dataAnalysis, href: `/${locale}/science-tech/analyse-de-donnees` },
        { name: t.natureEnvironment, href: `/${locale}/science-tech/nature-environnement` },
      ],
    },
    {
      title: t.employment,
      icon: Briefcase,
      items: [
        { name: t.offersBySector, href: `/${locale}/emploi/offres/sante` },
        { name: t.careerAdvice, href: `/${locale}/emploi/conseils-carriere` },
        { name: t.scholarshipsInternships, href: `/${locale}/emploi/bourses-stages` },
      ],
    },
    {
      title: t.practicalInfo,
      icon: Info,
      items: [
        { name: t.guides, href: `/${locale}/infos-pratiques/guides` },
        { name: t.tutorials, href: `/${locale}/infos-pratiques/tutoriels` },
        { name: t.resources, href: `/${locale}/infos-pratiques/ressources-educatives` },
      ],
    },
    {
      title: t.pressReleases,
      icon: Newspaper,
      items: [
        { name: t.government, href: `/${locale}/communiques/gouvernement` },
        { name: t.religious, href: `/${locale}/communiques/religieux` },
        { name: t.ngo, href: `/${locale}/communiques/ong` },
        { name: t.educational, href: `/${locale}/communiques/educatif` },
      ],
    },
    {
      title: t.blog,
      icon: BookOpen,
      items: [
        { name: t.tribunes, href: `/${locale}/blog/tribunes` },
        { name: t.chronicles, href: `/${locale}/blog/chroniques` },
        { name: t.investigations, href: `/${locale}/blog/enquetes` },
        { name: t.polls, href: `/${locale}/blog/sondages` },
      ],
    },
    {
      title: t.about,
      icon: Info,
      items: [
        { name: t.mission, href: `/${locale}/a-propos/mission` },
        { name: t.team, href: `/${locale}/a-propos/equipe` },
        { name: t.charter, href: `/${locale}/a-propos/charte` },
      ],
    },
  ];

  return (
    <nav className="sticky top-0 z-50">
      {/* Main Header - En-tête premium éditorial */}
      <div className="border-b border-[#e8e8e1] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-20 items-center justify-between gap-4">
            <div className="hidden flex-1 items-center gap-3 md:flex">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-[#e9e9e3] bg-[#f8f8f5] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1f2937] transition-colors hover:border-[#cfcfca] hover:bg-[#f1f1ee]"
                onClick={handleMenuToggle}
              >
                <Menu className="h-4 w-4" />
                <span>{t.menu}</span>
              </button>

              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-52 rounded-full border border-[#ecece7] bg-[#f8f8f5] px-4 py-2 pr-10 text-sm text-[#111827] outline-none transition focus:border-[#d4af37] focus:bg-white focus:ring-2 focus:ring-[#d4af37]/20"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b5563] transition-colors hover:text-[#0b3b8b]"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <button
                type="button"
                className="p-2 text-[#111827] transition-colors hover:text-[#0b3b8b]"
                onClick={handleMenuToggle}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="pointer-events-none absolute left-12 right-12 top-1/2 flex -translate-y-1/2 justify-center sm:left-20 sm:right-20 md:left-0 md:right-0">
              <Link href={`/${locale}`} className="pointer-events-auto inline-flex max-w-full items-center justify-center">
                <img
                  src="/images/logo.png"
                  alt="MalakInfo"
                  className="h-9 w-auto max-w-[110px] object-contain sm:h-12 sm:max-w-[180px] md:h-16 md:max-w-[260px] lg:h-20 lg:max-w-[300px]"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const textFallback = target.parentElement?.querySelector('.logo-fallback');
                    if (textFallback) {
                      (textFallback as HTMLElement).style.display = 'block';
                    }
                  }}
                />
                <span className="logo-fallback hidden font-heading text-lg font-black tracking-[-0.04em] text-[#0b3b8b] md:text-2xl">
                  MalakInfo
                </span>
              </Link>
            </div>

            <div className="hidden flex-1 items-center justify-end gap-4 md:flex">
              {activeUser ? (
                <div className="relative">
                  <button
                    className="flex items-center gap-2 rounded-full border border-[#ecece7] bg-[#f8f8f5] p-1.5 transition-colors hover:border-[#d4af37]"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    {activeUser.avatarUrl ? (
                      <img
                        src={activeUser.avatarUrl}
                        alt={activeUser.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b3b8b] text-white">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[#e5e7eb] bg-white py-2 shadow-xl">
                      <div className="border-b border-[#f1f1ef] px-4 py-2">
                        <p className="text-sm font-medium text-[#111827]">{activeUser.name}</p>
                        <p className="text-xs text-[#6b7280]">{activeUser.email}</p>
                      </div>
                      <Link href={`/${locale}/compte/profil`} className="flex items-center gap-2 px-4 py-2 text-sm text-[#111827] hover:bg-[#f7f7f5]" onClick={() => setIsUserMenuOpen(false)}>
                        <User className="h-4 w-4" />
                        <span>{t.myProfile}</span>
                      </Link>
                      <Link href={`/${locale}/compte/commentaires`} className="flex items-center gap-2 px-4 py-2 text-sm text-[#111827] hover:bg-[#f7f7f5]" onClick={() => setIsUserMenuOpen(false)}>
                        <MessageSquare className="h-4 w-4" />
                        <span>{t.myComments}</span>
                      </Link>
                      <Link href={`/${locale}/compte/likes`} className="flex items-center gap-2 px-4 py-2 text-sm text-[#111827] hover:bg-[#f7f7f5]" onClick={() => setIsUserMenuOpen(false)}>
                        <Heart className="h-4 w-4" />
                        <span>{t.myLikes}</span>
                      </Link>
                      <Link href={`/${locale}/compte/favoris`} className="flex items-center gap-2 px-4 py-2 text-sm text-[#111827] hover:bg-[#f7f7f5]" onClick={() => setIsUserMenuOpen(false)}>
                        <Bookmark className="h-4 w-4" />
                        <span>{t.favorites}</span>
                      </Link>
                      <Link href={`/${locale}/compte/dons`} className="flex items-center gap-2 px-4 py-2 text-sm text-[#111827] hover:bg-[#f7f7f5]" onClick={() => setIsUserMenuOpen(false)}>
                        <DollarSign className="h-4 w-4" />
                        <span>Mes dons</span>
                      </Link>
                      <Link href={`/${locale}/compte/parametres`} className="flex items-center gap-2 px-4 py-2 text-sm text-[#111827] hover:bg-[#f7f7f5]" onClick={() => setIsUserMenuOpen(false)}>
                        <Settings className="h-4 w-4" />
                        <span>{t.settings}</span>
                      </Link>
                      <div className="mt-2 border-t border-[#f1f1ef] pt-2">
                        <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut className="h-4 w-4" />
                          <span>{t.logout}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href={`/${locale}/compte/connexion?redirect=${encodeURIComponent(pathname)}`} className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1f2937] transition-colors hover:text-[#0b3b8b]">
                  <User className="h-4 w-4" />
                  <span>{t.login}</span>
                </Link>
              )}

              <Link href={`/${locale}/nous-soutenir`} className="rounded-full bg-[#0b3b8b] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#082a63]">
                {t.subscribe}
              </Link>

              <LanguageSwitcher />
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <LanguageSwitcher />
              {activeUser ? (
                <button className="p-2 text-[#111827] transition-colors hover:text-[#0b3b8b]" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                  {activeUser.avatarUrl ? (
                    <img src={activeUser.avatarUrl} alt={activeUser.name} className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </button>
              ) : (
                <Link href={`/${locale}/compte/connexion?redirect=${encodeURIComponent(pathname)}`} className="p-2 text-[#111827] transition-colors hover:text-[#0b3b8b]">
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Barre de Catégories style presse */}
      <div className="hidden border-b border-[#e6e6e1] bg-[#f9f8f5] md:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link href={`/${locale}`} className="whitespace-nowrap border-r border-[#e2e2dc] pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#111827] transition-colors hover:text-[#0b3b8b]">
              Accueil
            </Link>
            <Link href={`/${locale}?category=actualites`} className="whitespace-nowrap border-r border-[#e2e2dc] pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#111827] transition-colors hover:text-[#0b3b8b]">
              {t.news}
            </Link>
            <Link href={`/${locale}?category=politique`} className="whitespace-nowrap border-r border-[#e2e2dc] pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#111827] transition-colors hover:text-[#0b3b8b]">
              {t.politics}
            </Link>
            <Link href={`/${locale}?category=economie`} className="whitespace-nowrap border-r border-[#e2e2dc] pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#111827] transition-colors hover:text-[#0b3b8b]">
              {t.economy}
            </Link>
            <Link href={`/${locale}?category=science-tech`} className="whitespace-nowrap border-r border-[#e2e2dc] pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#111827] transition-colors hover:text-[#0b3b8b]">
              {t.scienceTech}
            </Link>
            <Link href={`/${locale}?category=culture`} className="whitespace-nowrap border-r border-[#e2e2dc] pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#111827] transition-colors hover:text-[#0b3b8b]">
              {t.culture}
            </Link>
            <Link href={`/${locale}?category=sport`} className="whitespace-nowrap border-r border-[#e2e2dc] pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#111827] transition-colors hover:text-[#0b3b8b]">
              {t.sport}
            </Link>
            <Link href={`/${locale}/religion`} className="whitespace-nowrap border-r border-[#e2e2dc] pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#111827] transition-colors hover:text-[#0b3b8b]">
              {t.religion}
            </Link>
            <Link href={`/${locale}/medias`} className="whitespace-nowrap border-r border-[#e2e2dc] pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#111827] transition-colors hover:text-[#0b3b8b]">
              {t.media}
            </Link>
          </div>
        </div>
      </div>

      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}
