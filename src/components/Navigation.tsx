'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, X, ChevronDown, ChevronRight, Newspaper, DollarSign, FlaskConical, Palette, Trophy, Radio, ScrollText, Briefcase, BookOpen, Info, Mail, Grip, LogOut, Settings, Heart, MessageSquare, Bookmark, Menu } from 'lucide-react';
import SearchBar from './SearchBar';
import LanguageSwitcher from './LanguageSwitcher';
import { useServicesModal } from '@/contexts/ServicesModalContext';
import frMessages from '../../messages/fr.json';
import enMessages from '../../messages/en.json';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isServicesOpen, openServices, closeServices } = useServicesModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'fr';
  const t = locale === 'fr' ? frMessages.nav : enMessages.nav;

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    checkAuth();

    // Listen for storage changes (for multi-tab support)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsUserMenuOpen(false);
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
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
    { name: t.economy, href: `/${locale}/actualites/economie` },
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
      {/* TopBar - Barre Supérieure Sombre */}
      <div className="bg-neutral-900 hidden md:flex">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center py-2">
            {/* Left side - Secondary links */}
            <div className="flex items-center space-x-6">
              <Link href={`/${locale}/emploi`} className="text-xs text-gray-300 hover:text-white transition-colors">
                Offres d'emploi
              </Link>
              <Link href={`/${locale}/communiques`} className="text-xs text-gray-300 hover:text-white transition-colors">
                Appels d'offres
              </Link>
              <Link href={`/${locale}/boutique`} className="text-xs text-gray-300 hover:text-white transition-colors">
                Boutique
              </Link>
              <Link href={`/${locale}/newsletter`} className="text-xs text-gray-300 hover:text-white transition-colors">
                Recevoir nos newsletters
              </Link>
            </div>
            
            {/* Right side - Partner sites */}
            <div className="flex items-center space-x-6">
              <Link href="https://thedrc.activitie.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-300 hover:text-white transition-colors">
                TheDRC.Activitie
              </Link>
              <Link href="https://businessgeneral.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-300 hover:text-white transition-colors">
                Business General
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - En-tête Principal Blanc Centré */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                className="flex items-center space-x-2 font-semibold text-foreground hover:text-primary transition-colors"
                onClick={() => isDropdownOpen ? setIsDropdownOpen(false) : openServices()}
              >
                <Menu className="w-5 h-5" />
                <span>Menu</span>
              </button>
              
              <div className="border-r border-gray-300 h-6 mx-3"></div>
              
              {/* Search field */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="bg-gray-100 rounded-lg px-4 py-1.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-48"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Left side - Mobile */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                className="p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => isDropdownOpen ? setIsDropdownOpen(false) : openServices()}
              >
                <Menu className="w-6 h-6" />
              </button>
              <button
                className="p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Center - Logo */}
            <Link href={`/${locale}`} className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="MalakInfo" 
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Right side - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href={`/${locale}/blog`} className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <BookOpen className="w-4 h-4" />
                <span>Magazine</span>
              </Link>
              
              {user ? (
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        href={`/${locale}/compte/profil`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Mon profil</span>
                      </Link>
                      <Link
                        href={`/${locale}/compte/commentaires`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Mes commentaires</span>
                      </Link>
                      <Link
                        href={`/${locale}/compte/likes`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4" />
                        <span>Mes likes</span>
                      </Link>
                      <Link
                        href={`/${locale}/compte/favoris`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>Favoris</span>
                      </Link>
                      <Link
                        href={`/${locale}/compte/parametres`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Paramètres</span>
                      </Link>
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={`/${locale}/compte/connexion`}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Se connecter</span>
                </Link>
              )}
              
              <Link
                href={`/${locale}/nous-soutenir`}
                className="bg-[#0B3B8B] hover:bg-[#082a63] rounded-full px-5 py-2 font-semibold text-white transition-colors"
              >
                S'abonner
              </Link>
              
              <LanguageSwitcher />
            </div>

            {/* Right side - Mobile */}
            <div className="md:hidden flex items-center space-x-2">
              <LanguageSwitcher />
              {user ? (
                <button
                  className="p-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </button>
              ) : (
                <Link
                  href={`/${locale}/compte/connexion`}
                  className="p-2 text-foreground hover:text-primary transition-colors"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Barre de Catégories */}
      <div className="bg-white border-b border-gray-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 py-3 overflow-x-auto">
            <Link href={`/${locale}/actualites`} className="font-bold text-sm tracking-wide text-[#081C3D] hover:text-[#D4AF37] transition-colors whitespace-nowrap">
              ACTUALITÉS
            </Link>
            <Link href={`/${locale}/actualites/politique`} className="font-bold text-sm tracking-wide text-[#081C3D] hover:text-[#D4AF37] transition-colors whitespace-nowrap">
              POLITIQUE
            </Link>
            <Link href={`/${locale}/actualites/economie`} className="font-bold text-sm tracking-wide text-[#081C3D] hover:text-[#D4AF37] transition-colors whitespace-nowrap">
              ÉCONOMIE
            </Link>
            <Link href={`/${locale}/science-tech`} className="font-bold text-sm tracking-wide text-[#081C3D] hover:text-[#D4AF37] transition-colors whitespace-nowrap">
              SCIENCE & TECH
            </Link>
            <Link href={`/${locale}/culture`} className="font-bold text-sm tracking-wide text-[#081C3D] hover:text-[#D4AF37] transition-colors whitespace-nowrap">
              CULTURE
            </Link>
            <Link href={`/${locale}/sport`} className="font-bold text-sm tracking-wide text-[#081C3D] hover:text-[#D4AF37] transition-colors whitespace-nowrap">
              SPORT
            </Link>
            <Link href={`/${locale}/classement`} className="font-bold text-sm tracking-wide text-[#D4AF37] hover:text-[#0B3B8B] transition-colors whitespace-nowrap">
              20 PAYS LES PLUS PERFORMANTS
            </Link>
            <Link href={`/${locale}/medias`} className="font-bold text-sm tracking-wide text-[#081C3D] hover:text-[#D4AF37] transition-colors whitespace-nowrap">
              MÉDIAS
            </Link>
            <Link href={`/${locale}/religion`} className="font-bold text-sm tracking-wide text-[#081C3D] hover:text-[#D4AF37] transition-colors whitespace-nowrap">
              RELIGION
            </Link>
          </div>
        </div>
      </div>

      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}
